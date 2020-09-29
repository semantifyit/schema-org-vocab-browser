class EnumerationRenderer {
    constructor(browser) {
        this.browser = browser;
        this.util = this.browser.util;
    }

    render() {
        const mainContent = this.util.createHeader(this.util.getTypeStructures(this.browser.term), 'rdfs:subClassOf') +
            this.createEnumerationMembers() +
            this.util.createRangesOf(true);
        this.browser.elem.innerHTML = this.util.createMainContent('rdfs:Class', mainContent);
    }

    createEnumerationMembers() {
        const enumMembers = this.browser.term.getEnumerationMembers();
        if (enumMembers.length !== 0) {
            return '' +
                'An Enumeration with:<br>' +
                '<browser>' +
                '<a id="enumbers" title="Link: #enumbers" href="#enumbers" class="clickableAnchor">' +
                'Enumeration members' +
                '</a>' +
                '</browser>' +
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
