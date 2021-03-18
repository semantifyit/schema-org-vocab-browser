/** This class is responsible to render a schema.org based DataType in the HTML element of the browser. */
class DataTypeRenderer {
    /**
     * Create a DataTypeRenderer object.
     *
     * @param {SDOVocabBrowser} browser - the underlying vocab browser to enable access to its data members.
     */
    constructor(browser) {
        this.browser = browser;
        this.util = this.browser.util;
    }

    /**
     * Render the DataType.
     */
    render() {
        const breadCrumbStart = this.util.createHtmlFullLink('schema:DataType', null, 'rdfs:subClassOf') + ' > ';
        const typeStructure = this.util.getTypeStructure(this.browser.term, 'getSuperDataTypes');
        const mainContent = this.util.createHtmlHeader(typeStructure, '', breadCrumbStart) + this.util.createHtmlRangesOf();
        this.browser.targetElement.innerHTML = this.util.createHtmlMainContent('rdfs:Class', mainContent);
    }
}

module.exports = DataTypeRenderer;
