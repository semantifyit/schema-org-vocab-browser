const TYPES_PLURAL = {
    'Class': 'Classes',
    'Property': 'Properties',
    'Enumeration': 'Enumerations',
    'Enumeration Member': 'Enumeration Members',
    'Data Type': 'Data Types'
};

class VocabRenderer {
    constructor(browser) {
        this.browser = browser;
        this.util = this.browser.util;
    }

    renderJSONLD() {
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

    createHeading() {
        return '' +
            '<span style="float: right;">' +
            '(' + this.util.createJSLink('format', 'jsonld', 'JSON-LD serialization') +
            (this.browser.list ? ' | from List: ' + this.util.createJSLink('voc', null, this.browser.list['schema:name']) : '') +
            ')' +
            '</span>' +
            (this.browser.vocName ? '<h1>' + this.browser.vocName + '</h1>' : '') +
            // If there is no headline, h2 should have no margin
            '<h2' + (this.browser.vocName ? '' : ' style="clear: none; margin: 0;"') + '>Namespaces</h2>' +
            '<ul>' +
            Object.entries(this.browser.namespaces).map((vocab) => {
                return '<li>' + vocab[0] + ': ' + vocab[1] + '</li>';
            }).join('') +
            '</ul>';
    }

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

    createContentListElement(objects, typeSingular) {
        if (objects.length !== 0) {
            const typePlural = TYPES_PLURAL[typeSingular];
            return '<li><a href="#' + this.util.underscore(typePlural) + '">' + objects.length + ' ' +
                (objects.length === 1 ? typeSingular : typePlural) + '</a></li>';
        }
        return '';
    }

    createSection(objects, typeSingular) {
        if (objects.length !== 0) {
            const typePlural = TYPES_PLURAL[typeSingular];
            return '' +
                '<h2 id="' + this.util.underscore(typePlural) + '">' + typePlural + '</h2>' +
                '<table class="definition-table">' +
                '<thead>' +
                '<tr>' +
                '<th>' + typeSingular + '</th>' +
                '<th>Description</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody class="supertype">' +
                this.createSectionTbody(objects) +
                '</tbody>' +
                '</table>'
        }
        return '';
    }

    createSectionTbody(objects) {
        return objects.map((name) => {
            const term = this.browser.sdoAdapter.getTerm(name);
            return this.util.createTableRow(term.getTermType(),
                this.util.createIRIwithQueryParam('term', name),
                '@id',
                this.util.createJSLink('term', name),
                '<td property="rdfs:comment">' + (term.getDescription() || '') + '</td>');
        }).join('');
    }
}

module.exports = VocabRenderer;
