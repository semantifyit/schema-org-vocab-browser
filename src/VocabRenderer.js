/**
 * A constant to map singulars to their plural forms for term types.
 *
 * @type {{Enumeration: string, "Data Type": string, "Enumeration Member": string, Class: string, Property: string}}
 */
const TYPES_PLURAL = {
    'Class': 'Classes',
    'Property': 'Properties',
    'Enumeration': 'Enumerations',
    'Enumeration Member': 'Enumeration Members',
    'Data Type': 'Data Types'
};

/** This class is responsible to render a schema.org based Vocabulary in the HTML element of the browser. */
class VocabRenderer {
    /**
     * Create a VocabRenderer object.
     *
     * @param {SDOVocabBrowser} browser - the underlying vocab browser to enable access to its data members.
     */
    constructor(browser) {
        this.browser = browser;
        this.util = this.browser.util;
    }

    /**
     * Render the JSON-LD serialization of the Vocabulary.
     */
    renderJsonld() {
        const preStyle = '' +
            // Overwrite schema.org CSS
            'font-size: medium; ' +
            'background: none; ' +
            'text-align: left; ' +
            'width: auto; ' +
            'padding: 0; ' +
            'overflow: visible; ' +
            'color: rgb(0, 0, 0); ' +
            'line-height: normal; ' +

            // Defaults for pre https://www.w3schools.com/cssref/css_default_values.asp
            'display: block; ' +
            'font-family: monospace; ' +
            'margin: 1em 0; ' +

            // From Browser when loading json-ld file
            'word-wrap: break-word; ' +
            'white-space: pre-wrap;';

        this.browser.elem.innerHTML = '' +
            '<pre style="' + preStyle + '">' +
            JSON.stringify(this.browser.vocab, null, 2) +
            '</pre>';
    }

    /**
     * Render the Vocabulary.
     */
    render() {
        const mainContent = this.createHeading() +
            this.createContentSection() +
            this.createSection(this.browser.classes, 'Class') +
            this.createSection(this.browser.properties, 'Property') +
            this.createSection(this.browser.enumerations, 'Enumeration') +
            this.createSection(this.browser.enumerationMembers, 'Enumeration Member') +
            this.createSection(this.browser.dataTypes, 'Data Type');
        this.browser.elem.innerHTML = this.util.createMainContent('schema:DataSet', mainContent);
    }

    /**
     * Create HTML for the heading of the Vocabulary.
     *
     * @returns {string} The resulting HTML.
     */
    createHeading() {
        return '' +
            '<span style="float: right;">' +
            '(' + this.util.createJSLink('format', 'jsonld', 'JSON-LD serialization') +
            (this.browser.list ? ' | from List: ' +
                this.util.createJSLink('voc', null, this.browser.list['schema:name']) : '') +
            ')' +
            '</span>' +
            '<h1>' + (this.browser.vocName ? this.browser.vocName : 'Vocabulary') + '</h1>' +
            // If there is no headline, h2 should have no margin
            '<h2>Namespaces</h2>' +
            '<ul>' +
            Object.entries(this.browser.namespaces).map((vocab) => {
                return '<li>' + vocab[0] + ': ' + vocab[1] + '</li>';
            }).join('') +
            '</ul>';
    }

    /**
     * Create HTML for the content section of the Vocabulary.
     *
     * @returns {string} The resulting HTML.
     */
    createContentSection() {
        return '' +
            '<h2>Content</h2>' +
            '<ul>' +
            this.createContentListElement(this.browser.classes, 'Class') +
            this.createContentListElement(this.browser.properties, 'Property') +
            this.createContentListElement(this.browser.enumerations, 'Enumeration') +
            this.createContentListElement(this.browser.enumerationMembers, 'Enumeration Member') +
            this.createContentListElement(this.browser.dataTypes, 'Data Type') +
            '</ul>';
    }

    /**
     * Create a HTML list element for a specific term type of the Vocabulary.
     *
     * @param {string[]} terms - The vocabulary terms with the same term type.
     * @param {string} typeSingular - The singular form of the term type.
     * @returns {string} The resulting HTML.
     */
    createContentListElement(terms, typeSingular) {
        if (terms.length !== 0) {
            const typePlural = TYPES_PLURAL[typeSingular];
            return '<li><a href="#' + this.util.underscore(typePlural) + '">' + terms.length + ' ' +
                (terms.length === 1 ? typeSingular : typePlural) + '</a></li>';
        }
        return '';
    }

    /**
     * Create HTML for a section of the Vocabulary.
     *
     * @param {string[]} terms - The vocabulary terms with the same term type.
     * @param {string} typeSingular - The singular form of the term type.
     * @returns {string} The resulting HTML.
     */
    createSection(terms, typeSingular) {
        if (terms.length !== 0) {
            const typePlural = TYPES_PLURAL[typeSingular];
            return '' +
                '<h2 id="' + this.util.underscore(typePlural) + '">' + typePlural + '</h2>' +
                this.util.createDefinitionTable([typeSingular, 'Description'],
                    this.createSectionTbody(terms),
                    {'class': 'supertype'});
        }
        return '';
    }

    /**
     * Create HTML table body for a section of the Vocabulary.
     *
     * @param {string[]} terms - The vocabulary terms with the same term type.
     * @returns {string} The resulting HTML.
     */
    createSectionTbody(terms) {
        return terms.map((name) => {
            const term = this.browser.sdoAdapter.getTerm(name);
            return this.util.createTableRow(term.getTermType(),
                this.util.createIriWithQueryParam('term', name),
                '@id',
                this.util.createJSLink('term', name),
                '<td property="rdfs:comment">' + (term.getDescription() || '') + '</td>');
        }).join('');
    }
}

module.exports = VocabRenderer;
