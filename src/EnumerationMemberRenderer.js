/** This class is responsible to render a schema.org based EnumerationMember in the HTML element of the browser. */
class EnumerationMemberRenderer {
    /**
     * Create a EnumerationMemberRenderer object.
     *
     * @param {SDOVocabBrowser} browser - the underlying vocab browser to enable access to its data members.
     */
    constructor(browser) {
        this.browser = browser;
        this.util = this.browser.util;
    }

    /**
     * Render the EnumerationMember.
     */
    render() {
        const typeStructure = this.browser.term.getDomainEnumerations().flatMap((d) => {
            return this.util.getTypeStructure(this.browser.sdoAdapter.getClass(d));
        });
        const breadCrumbEnd = ' :: ' + this.util.createLink(this.browser.term.getIRI(true));
        const mainContent = this.util.createHtmlHeader(typeStructure, '@type', '', breadCrumbEnd) +
            this.createHtmlDomains();
        this.browser.targetElement.innerHTML = this.util.createHtmlMainContent('rdfs:Class', mainContent);
    }

    /**
     * Create HTML for the domains of the EnumerationMember.
     *
     * @returns {string} The resulting HTML.
     */
    createHtmlDomains() {
        const domains = this.browser.term.getDomainEnumerations();
        return 'A member value for enumeration' + (domains.length > 1 ? 's' : '') + ': ' +
            domains.map((d) => this.util.createLink(d)).join(', ') +
            '<br>';
    }
}

module.exports = EnumerationMemberRenderer;
