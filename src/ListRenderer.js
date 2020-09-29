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
        return this.browser.list['schema:hasPart'].map((vocab, i) => {
            return '' +
                this.util.createTableRow('http://vocab.sti2.at/ds/Vocabulary',
                    this.util.createIRIwithQueryParam('voc', i + 1),
                    'schema:name',
                    this.util.createJSLink('a-vocab-name', 'voc', i + 1, 'TODO'),
                    this.createVocabsSideCols(vocab)
                );
        }).join('');
    }

    createVocabsSideCols(vocab) {
        return '' +
            '<td property="@id">' + this.util.createExternalLink(vocab['@id']) + '</td>' +
            '<td property="schema:author">' + /*TODO: vocab.author + */ '</td>' +
            '<td property="schema:description">' + /*TODO: vocab.description + */ '</td>';
    }

    addEventListener() {
        const aVocabNames = document.getElementsByClassName('a-vocab-name');

        for (let i = 0; i < aVocabNames.length; i++) { // forEach() not possible ootb for HTMLCollections
            const aVocabName = aVocabNames[i];
            aVocabName.addEventListener('click', async () => {
                history.pushState(null, null, this.util.createIRIwithQueryParam('voc', i + 1));
                await this.browser.render();
            });
        }
    }
}

module.exports = ListRenderer;
