class ClassRenderer {
    constructor(browser) {
        this.browser = browser;
        this.util = this.browser.util;
    }

    render() {
        const superTypes = this.util.getTypeStructures(this.browser.term);
        const mainContent = this.util.createHeader(superTypes, 'rdfs:subClassOf') +
            this.createProperties();
        this.browser.elem.innerHTML = this.util.createMainContent('rdfs:Class', mainContent);
    }

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

    createSpecificTypes() {
        const subClasses = this.browser.term.getSubClasses(false);
        if (subClasses.length !== 0) {
            return '' +
                '<browser>' +
                '<a id="subtypes" title="Link: #subtypes" href="#subtypes" class="clickableAnchor">' +
                'More specific Types' +
                '</a>' +
                '</browser>' +
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
