class ListRenderer {
    constructor(browser) {
        this.browser = browser;
        this.util = this.browser.util;
    }

    render() {
        const mainContent = this.createHeader() + this.createVocabsTable();
        this.browser.elem.innerHTML = this.util.createMainContent('schema:DataSet', mainContent);
        this.addEventListener();
    }

    createHeader() {
        return '<h1>' + this.browser.list['schema:name'] + '</h1>';
    }

    createVocabsTable() {
        return '' +
            '<table class="definition-table">' +
            '<thead>' +
            '<tr>' +
            '<th>Name</th>' +
            '<th>IRI</th>' +
            '<th>Author</th>' +
            '<th>Description</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody class="supertype">' +
            this.createVocabsTbody() +
            '</tbody>' +
            '</table>'
    }

    createVocabsTbody() {
        return this.browser.list['schema:hasPart'].map((vocab) => {
            return this.util.createTableRow('http://vocab.sti2.at/ds/Vocabulary',
                vocab['@id'],
                'schema:name',
                this.util.createJSLink('a-vocab-name', 'voc', vocab['@id'].split('/').pop(), vocab['schema:name'] || 'No Name'),
                this.createVocabsSideCols(vocab)
            );
        }).join('');
    }

    createVocabsSideCols(vocab) {
        return '' +
            '<td property="@id">' + this.util.createExternalLink(vocab['@id']) + '</td>' +
            '<td property="schema:author">' +
            ((vocab['schema:author'] && vocab['schema:author']['schema:name']) || '') +
            '</td>' +
            '<td property="schema:description">' + (vocab['schema:description'] || '') + '</td>';
    }

    addEventListener() {
        const aVocabNames = document.getElementsByClassName('a-vocab-name');

        for (const aVocabName of aVocabNames) { // forEach() not possible ootb for HTMLCollections
            aVocabName.addEventListener('click', async () => {
                history.pushState(null, null, aVocabName.href);
                await this.browser.render();
            });
        }
    }
}

module.exports = ListRenderer;
