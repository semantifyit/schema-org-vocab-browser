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
        const mainContent = this.createHeader() + this.createVocabsTable();
        this.browser.elem.innerHTML = this.util.createMainContent('schema:DataSet', mainContent);
    }

    /**
     * Create HTML for the header of the List.
     *
     * @returns {string} The resulting HTML
     */
    createHeader() {
        return '' +
            '<h1>' + this.browser.list['schema:name'] + '</h1>' +
            this.util.createExternalLinkLegend();
    }

    /**
     * Create HTML table for the vocabularies of the List.
     *
     * @returns {string} The resulting HTML.
     */
    createVocabsTable() {
        return this.util.createDefinitionTable(['Name', 'IRI', 'Author', 'Description'],
            this.createVocabsTbody(),
            {'class': 'supertype'});
    }

    /**
     * Create HTML table bodies for the vocabularies of the List.
     *
     * @returns {string} The resulting HTML.
     */
    createVocabsTbody() {
        return this.browser.list['schema:hasPart'].map((vocab) => {
            return this.util.createTableRow('http://vocab.sti2.at/ds/Vocabulary',
                vocab['@id'],
                'schema:name',
                this.util.createJSLink('voc', vocab['@id'].split('/').pop(), vocab['schema:name'] || 'No Name'),
                this.createVocabsSideCols(vocab)
            );
        }).join('');
    }

    /**
     * Create HTML side columns for a vocabulary of the List.
     *
     * @param {object} vocab - The vocabulary of the List.
     * @returns {string} The resulting HTML.
     */
    createVocabsSideCols(vocab) {
        return '' +
            '<td property="@id">' + this.util.createExternalLink(vocab['@id']) + '</td>' +
            '<td property="schema:author">' +
            ((vocab['schema:author'] && vocab['schema:author']['schema:name']) || '') +
            '</td>' +
            '<td property="schema:description">' + (vocab['schema:description'] || '') + '</td>';
    }
}

module.exports = ListRenderer;
