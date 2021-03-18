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
        const mainContent = this.util.createHtmlHeader(typeStructure, 'rdfs:subClassOf') +
            this.createHtmlEnumerationMembers() +
            this.util.createHtmlRangesOf(true);
        this.browser.targetElement.innerHTML = this.util.createHtmlMainContent('rdfs:Class', mainContent);
    }

    /**
     * Create HTML for the enumeration members of the Enumeration.
     *
     * @returns {string} The resulting HTML.
     */
    createHtmlEnumerationMembers() {
        const enumMembers = this.browser.term.getEnumerationMembers();
        if (enumMembers.length === 0) {
            return '';
        }
        const htmlEnumMembers = enumMembers.map((e) => {
            return '<li>' + this.util.createLink(e) + '</li>';
        }).join('');
        return `An Enumeration with enumeration members:<br><ul>${htmlEnumMembers}</ul><br>`;
    }
}

module.exports = EnumerationRenderer;
