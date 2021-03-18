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
        const mainContent = this.util.createHtmlHeader(typeStructure, 'rdfs:subClassOf') + this.createHtmlProperties();
        this.browser.targetElement.innerHTML = this.util.createHtmlMainContent('rdfs:Class', mainContent);
    }

    /**
     * Create a HTML table for the properties of the Class.
     *
     * @returns {string} - The resulting HTML.
     */
    createHtmlProperties() {
        let html = '<table class="definition-table">' +
            this.createHtmlPropertiesHeader();

        const classes = [this.browser.term,
            ...this.browser.term.getSuperClasses().map((c) => this.browser.sdoAdapter.getClass(c))];
        classes.forEach((c) => {
            const properties = c.getProperties(false);
            if (properties.length !== 0) {
                html += '<tbody>' +
                    this.createHtmlPropertyHeader(c);
                properties.forEach((p) => {
                    html += this.util.createPropertyTableRow(p);
                });
                html += '</tbody>';
            }
        });
        html += '</table>' +
            '<br>' +
            this.createHtmlSpecificTypes();

        return html;
    }

    /**
     * Create a HTML table header for the properties of the Class.
     *
     * @returns {string} - The resulting HTML.
     */
    createHtmlPropertiesHeader() {
        return `<thead><tr>
            <th>Property</th>
            <th>Expected Type</th>
            <th>Description</th>
            </tr></thead>`;
    }

    /**
     * Create a HTML table body for a property of the Class.
     *
     * @returns {string} - The resulting HTML.
     */
    createHtmlPropertyHeader(className) {
        const htmlSuperClass = this.util.createLink(className.getIRI(true));
        return `<tbody><tr class="supertype">
            <th class="supertype-name" colspan="3">
            Properties from ${htmlSuperClass}
            </th></tr></tbody>`;
    }

    /**
     * Create HTML for the more specific types of the Class.
     *
     * @returns {string} - The resulting HTML.
     */
    createHtmlSpecificTypes() {
        const subClasses = this.browser.term.getSubClasses(false);
        if (subClasses.length === 0) {
            return '';
        }
        const htmlSubClasses = subClasses.map((s) => {
            return '<li>' + this.util.createLink(s) + '</li>';
        });
        return `<b><a id="subtypes" title="Link: #subtypes" href="#subtypes" class="clickableAnchor">
            More specific Types</a></b>
            <ul>${htmlSubClasses}</ul><br>`;
    }
}

module.exports = ClassRenderer;
