/** This class is responsible to render a schema.org based Enumeration in the HTML element of the browser. */
class EnumerationRenderer {
    /**
     * Create a EnumerationRenderer object.
     *
     * @param {SDOVocabBrowser} browser - the underlying vocab browser to enable access to its data members.
     */
    constructor(browser) {
        this.browser = browser;
        this.util = this.browser.util;
    }

    /**
     * Render the Enumeration.
     */
    render() {
        const typeStructure = this.util.getTypeStructure(this.browser.term);
        const mainContent = this.util.createHeader(typeStructure, 'rdfs:subClassOf') +
            this.createEnumerationMembers() +
            this.util.createRangesOf(true);
        this.browser.elem.innerHTML = this.util.createMainContent('rdfs:Class', mainContent);
    }

    /**
     * Create HTML for the enumeration members of the Enumeration.
     *
     * @returns {string} The resulting HTML.
     */
    createEnumerationMembers() {
        const enumMembers = this.browser.term.getEnumerationMembers();
        if (enumMembers.length !== 0) {
            return '' +
                'An Enumeration with:<br>' +
                '<b>' +
                '<a id="enumbers" title="Link: #enumbers" href="#enumbers" class="clickableAnchor">' +
                'Enumeration members' +
                '</a>' +
                '</b>' +
                '<ul>' +
                enumMembers.map((e) => {
                    return '<li>' + this.util.createLink(e) + '</li>';
                }).join('') +
                '</ul>' +
                '<br>';
        } else {
            return '';
        }
    }
}

module.exports = EnumerationRenderer;
