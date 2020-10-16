/** This class is responsible to render a schema.org based Class in the HTML element of the browser. */
class ClassRenderer {
    /**
     * Create a ClassRenderer object.
     *
     * @param {SDOVocabBrowser} browser - the underlying vocab browser to enable access to its data members.
     */
    constructor(browser) {
        this.browser = browser;
        this.util = this.browser.util;
    }

    /**
     * Render the Class.
     */
    render() {
        const typeStructure = this.util.getTypeStructure(this.browser.term);
        const mainContent = this.util.createHeader(typeStructure, 'rdfs:subClassOf') + this.createProperties();
        this.browser.elem.innerHTML = this.util.createMainContent('rdfs:Class', mainContent);
    }

    /**
     * Create a HTML table for the properties of the Class.
     *
     * @returns {string} - The resulting HTML.
     */
    createProperties() {
        let html = '<table class="definition-table">' +
            this.createPropertiesHeader();

        const classes = [this.browser.term,
            ...this.browser.term.getSuperClasses().map((c) => this.browser.sdoAdapter.getClass(c))];
        classes.forEach((c) => {
            const properties = c.getProperties(false);
            if (properties.length !== 0) {
                html += '<tbody>' +
                    this.createPropertyHeader(c);
                properties.forEach((p) => {
                    html += this.util.createPropertyTableRow(p);
                });
                html += '</tbody>';
            }
        });
        html += '</table>' +
            '<br>' +
            this.createSpecificTypes();

        return html;
    }

    /**
     * Create a HTML table header for the properties of the Class.
     *
     * @returns {string} - The resulting HTML.
     */
    createPropertiesHeader() {
        return '' +
            '<thead>' +
            '<tr>' +
            '<th>Property</th>' +
            '<th>Expected Type</th>' +
            '<th>Description</th>' +
            '</tr>' +
            '</thead>';
    }

    /**
     * Create a HTML table body for a property of the Class.
     *
     * @returns {string} - The resulting HTML.
     */
    createPropertyHeader(className) {
        return '' +
            '<tbody>' +
            '<tr class="supertype">' +
            '<th class="supertype-name" colspan="3">' +
            'Properties from ' + this.util.createLink(className.getIRI(true)) +
            '</th>' +
            '</tr>' +
            '</tbody>';
    }

    /**
     * Create HTML for the more specific types of the Class.
     *
     * @returns {string} - The resulting HTML.
     */
    createSpecificTypes() {
        const subClasses = this.browser.term.getSubClasses(false);
        if (subClasses.length !== 0) {
            return '' +
                '<b>' +
                '<a id="subtypes" title="Link: #subtypes" href="#subtypes" class="clickableAnchor">' +
                'More specific Types' +
                '</a>' +
                '</b>' +
                '<ul>' +
                subClasses.map((s) => {
                    return '<li>' + this.util.createLink(s) + '</li>';
                }) +
                '</ul>' +
                '<br>';
        } else {
            return '';
        }
    }
}

module.exports = ClassRenderer;
