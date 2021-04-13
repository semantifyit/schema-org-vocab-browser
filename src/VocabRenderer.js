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
        // Overwrite schema.org CSS
        // Defaults for pre https://www.w3schools.com/cssref/css_default_values.asp
        // From Browser when loading json-ld file
        const preStyle = `font-size: medium; 
            background: none; 
            text-align: left; 
            width: auto; 
            padding: 0; 
            overflow: visible; 
            color: rgb(0, 0, 0); 
            line-height: normal; ä
            display: block; 
            font-family: monospace; 
            margin: 1em 0; 
            word-wrap: break-word; 
            white-space: pre-wrap;`;
        const vocabJsonLD = JSON.stringify(this.browser.vocab, null, 2);
        this.browser.targetElement.innerHTML = `<pre style="${preStyle}">${vocabJsonLD}</pre>`;
    }

    /**
     * Render the Vocabulary.
     */
    render() {
        const mainContent = this.createHeading() +
            this.createNamespaces() +
            this.createContentSection() +
            this.createSection(this.browser.classes, 'Class') +
            this.createSection(this.browser.properties, 'Property') +
            this.createSection(this.browser.enumerations, 'Enumeration') +
            this.createSection(this.browser.enumerationMembers, 'Enumeration Member') +
            this.createSection(this.browser.dataTypes, 'Data Type');
        this.browser.targetElement.innerHTML = this.util.createHtmlMainContent('schema:DataSet', mainContent);
        if (window.location.hash !== "") {
            this.browser.scrollToSection(window.location.hash.substring(1));
        }
    }

    /**
     * Create HTML for the heading of the Vocabulary.
     *
     * @returns {string} The resulting HTML.
     */
    createHeading() {
        let htmlFormatLink;
        if (this.browser.locationControl) {
            htmlFormatLink = this.util.createInternalLink({
                format: 'jsonld'
            }, 'JSON-LD serialization');
        } else {
            htmlFormatLink = "<a href=\"https://semantify.it/voc/".concat(this.browser.vocId, "?format=jsonld\" target=\"_blank\">JSON-LD serialization</a>");
        }
        // const htmlFormatLink = this.util.createInternalLink({format: 'jsonld'}, 'JSON-LD serialization');
        const htmlListLink = this.browser.list ? ' | from List: ' +
            this.util.createInternalLink({vocId: null}, this.browser.list['schema:name']) : '';
        const htmlTitle = this.browser.getVocabName() || 'Vocabulary';
        const htmlLinkLegend = this.util.createHtmlExternalLinkLegend();
        return `<span style="float: right;">(${htmlFormatLink} ${htmlListLink})</span>
                <h1>${htmlTitle}</h1>${htmlLinkLegend}`;
    }

    /**
     * Create HTML for the namespaces of the Vocabulary.
     *
     * @returns {string} The resulting HTML.
     */
    createNamespaces() {
        return '' +
            '<h2 style="margin: revert;">Namespaces</h2>' +
            '<ul>' +
            Object.entries(this.browser.namespaces).map((vocab) => {
                return '<li>' + vocab[0] + ': ' + this.util.createExternalLink(vocab[1]) + '</li>';
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
            '<h2 style="margin: revert;">Content</h2>' +
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
        if (terms.length === 0) {
            return '';
        }
        const typePlural = TYPES_PLURAL[typeSingular];
        const hrefLink = this.browser.locationControl ? '#' + this.util.underscore(typePlural) : 'javascript:void(0)';
        const htmlOnClick = this.browser.locationControl ? 'onclick="return false;"' : '';
        const linkText = terms.length + ' ' + (terms.length === 1 ? typeSingular : typePlural);
        return `<li><a class="a-section-link" href="${hrefLink}" data-section-link="${typePlural}" ${htmlOnClick}>${linkText}</a></li>`;
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
            let ths;
            if (typeSingular === 'Enumeration Member') {
                ths = [typeSingular, 'of Enumeration', 'Description'];
            } else {
                ths = [typeSingular, 'Description'];
            }
            return '' +
                '<h2 id="' + this.util.underscore(typePlural) + '">' + typePlural + '</h2>' +
                this.util.createHtmlDefinitionTable(ths,
                    this.createSectionTbody(terms, typeSingular),
                    {'class': 'supertype'});
        }
        return '';
    }

    /**
     * Create HTML table body for a section of the Vocabulary.
     *
     * @param {string[]} terms - The vocabulary terms with the same term type.
     * @param {?string} typeSingular - The type of the terms
     * @returns {string} The resulting HTML.
     */
    createSectionTbody(terms, typeSingular = null) {
        return terms.map((name) => {
            const term = this.browser.sdoAdapter.getTerm(name);
            let sideCols = "";
            if (typeSingular === 'Enumeration Member') {
                let hostEnumHtml = "";
                try {
                    let enumHostArray = this.browser.sdoAdapter.getEnumerationMember(name).getDomainEnumerations(false);
                    // is an array, most of the times it is only 1 element
                    for (const enHost of enumHostArray) {
                        hostEnumHtml += this.util.createInternalLink({termURI: enHost}, enHost) + "</br>";
                    }
                } catch (e) {
                    // error -> add nothing
                }
                sideCols += `<td>${hostEnumHtml}</td>`;
            }
            sideCols += '<td property="rdfs:comment">' + this.util.repairLinksInHTMLCode(term.getDescription() || '') + '</td>';

            return this.util.createHtmlTableRow(term.getTermType(),
                this.util.createIriWithQueryParam('term', name),
                '@id',
                this.util.createInternalLink({termURI: name}, name),
                sideCols);
        }).join('');
    }
}

module.exports = VocabRenderer;
