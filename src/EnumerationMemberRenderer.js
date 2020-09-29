class EnumerationMemberRenderer {
    constructor(browser) {
        this.browser = browser;
        this.util = this.browser.util;
    }

    render() {
        const typeStructures = this.browser.term.getDomainEnumerations().flatMap((d) => {
            return this.util.getTypeStructures(this.browser.sdoAdapter.getClass(d));
        });
        const breadCrumbEnd = ' :: ' + this.util.createLink(this.browser.term.getIRI(true));
        // TODO: Can we use @type here?
        const mainContent = this.util.createHeader(typeStructures, '@type', '', breadCrumbEnd) +
            this.createDomains();
        this.browser.elem.innerHTML = this.util.createMainContent('rdfs:Class', mainContent);
    }

    createDomains() {
        const domains = this.browser.term.getDomainEnumerations();
        return 'A member value for enumeration' + (domains.length > 1 ? 's' : '') + ': ' +
            domains.map((d) => this.util.createLink(d)).join(', ') +
            '<br>';
    }
}

module.exports = EnumerationMemberRenderer;
