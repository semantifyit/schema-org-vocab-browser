const SDOAdapter = require('schema-org-adapter');

class SDOVocabBrowser {
    constructor(elem, vocabOrVocabList) {
        return(async () => {
            this.elem = elem;
            this.vocabOrVocabList = vocabOrVocabList;
            this.sdoAdapter = new SDOAdapter();

            // TODO: differentiate between vocab and list
            const sdoURL = await this.sdoAdapter.constructSDOVocabularyURL('latest', 'all-layers');
            await this.sdoAdapter.addVocabularies([sdoURL, vocabOrVocabList]);

            this.generateHTML();

            return this;
        })();
    }

    generateHTML() {
        let html = '<b>Content</b>' +
            '<ul>';

        let vocabs = this.sdoAdapter.getVocabularies(this.vocabOrVocabList);
        delete vocabs['schema'];
        const vocabNames = Object.keys(vocabs);
        const classes = this.sdoAdapter.getListOfClasses({ fromVocabulary: vocabNames });
        // TODO: Add other stuff

        html += '<li>' + classes.length + ' Classes</li>';
        html += '</ul>';

        // TODO: Add more

        this.elem.innerHTML = html;
    }
}

module.exports = SDOVocabBrowser;