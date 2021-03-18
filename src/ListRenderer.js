/** This class is responsible to render a semantify.it based List in the HTML element of the browser. */
class ListRenderer {
    /**
     * Create a ListRenderer object.
     *
     * @param {SDOVocabBrowser} browser - the underlying vocab browser to enable access to its data members.
     */
    constructor(browser) {
        this.browser = browser;
        this.util = this.browser.util;
    }

    /**
     * Render the List.
     */
    render() {
        const mainContent = this.createHtmlHeader() + this.createHtmlVocabsTable();
        this.browser.targetElement.innerHTML = this.util.createHtmlMainContent('schema:DataSet', mainContent);
    }

    /**
     * Create HTML for the header of the List.
     *
     * @returns {string} The resulting HTML
     */
    createHtmlHeader() {
        const listName = this.browser.list['schema:name'];
        const htmlExternalLinkLegend = this.util.createHtmlExternalLinkLegend();
        const description = this.browser.list['schema:description'] || '';
        return `<h1>${listName}</h1>
            ${htmlExternalLinkLegend}
            ${description}`;
    }

    /**
     * Create HTML table for the vocabularies of the List.
     *
     * @returns {string} The resulting HTML.
     */
    createHtmlVocabsTable() {
        return this.util.createHtmlDefinitionTable(['Name', 'IRI', 'Author', 'Description'],
            this.createHtmlVocabsTbody(),
            {'class': 'supertype'});
    }

    /**
     * Create HTML table bodies for the vocabularies of the List.
     *
     * @returns {string} The resulting HTML.
     */
    createHtmlVocabsTbody() {
        return this.browser.list['schema:hasPart'].map((vocab) => {
            return this.util.createHtmlTableRow('http://vocab.sti2.at/ds/Vocabulary',
                vocab['@id'],
                'schema:name',
                this.util.createHtmlJSLink('voc', vocab['@id'].split('/').pop(), vocab['schema:name'] || 'No Name'),
                this.createHtmlVocabsSideCols(vocab)
            );
        }).join('');
    }

    /**
     * Create HTML side columns for a vocabulary of the List.
     *
     * @param {object} vocab - The vocabulary of the List.
     * @returns {string} The resulting HTML.
     */
    createHtmlVocabsSideCols(vocab) {
        const htmlLink = this.util.createExternalLink(vocab['@id']);
        const htmlAuthor = ((vocab['schema:author'] && vocab['schema:author']['schema:name']) || '');
        const htmlDescription = (vocab['schema:description'] || '');
        return `<td property="@id">${htmlLink}</td>
            <td property="schema:author">${htmlAuthor}</td>
            <td property="schema:description">${htmlDescription}</td>`;
    }
}

module.exports = ListRenderer;
