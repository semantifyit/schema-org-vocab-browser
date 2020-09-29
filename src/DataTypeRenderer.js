class DataTypeRenderer {
    constructor(browser) {
        this.browser = browser;
        this.util = this.browser.util;
    }

    render() {
        const breadCrumbStart = this.util.createFullLink('schema:DataType', null, 'rdfs:subClassOf') + ' > ';
        const mainContent = '' +
            this.util.createHeader(
                this.util.getTypeStructures(this.browser.term, 'getSuperDataTypes'), '', breadCrumbStart) +
            this.util.createRangesOf();
        this.browser.elem.innerHTML = this.util.createMainContent('rdfs:Class', mainContent);
    }
}

module.exports = DataTypeRenderer;
