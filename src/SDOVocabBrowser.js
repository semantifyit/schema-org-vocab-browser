const SDOAdapter = require('schema-org-adapter');

class SDOVocabBrowser {
    constructor(elem, vocabOrVocabList) {
        return(async () => {
            this.elem = elem;
            this.vocabOrVocabList = vocabOrVocabList;
            this.sdoAdapter = new SDOAdapter();

            // TODO: differentiate between vocab and list
            // TODO: Add loader
            const sdoURL = await this.sdoAdapter.constructSDOVocabularyURL('latest', 'all-layers');
            await this.sdoAdapter.addVocabularies([sdoURL, vocabOrVocabList]);

            let vocabs = this.sdoAdapter.getVocabularies(this.vocabOrVocabList);
            delete vocabs['schema'];
            const vocabNames = Object.keys(vocabs);
            this.classes = this.sdoAdapter.getListOfClasses({ fromVocabulary: vocabNames});
            this.properties = this.sdoAdapter.getListOfProperties({fromVocabulary: vocabNames});
            this.enumerations = this.sdoAdapter.getListOfEnumerations({fromVocabulary: vocabNames});
            this.enumerationMembers = this.sdoAdapter.getListOfEnumerationMembers({fromVocabulary: vocabNames});
            this.dataTypes = this.sdoAdapter.getListOfDataTypes({fromVocabulary: vocabNames});

            this.generateHTML();

            return this;
        })();
    }

    generateHTML() {
        let html = this.generateContentSection();

        // TODO: Add other html

        this.elem.innerHTML = html;
    }

    generateContentSection() {
        let html = '<b>Content</b>' +
            '<ul>';

        if (this.classes.length !== 0) {
            html += '<li>' + this.classes.length + ' Classes</li>';
        }

        if (this.properties.length !== 0) {
            html += '<li>' + this.properties.length + ' Properties</li>';
        }

        if (this.enumerations.length !== 0) {
            html += '<li>' + this.enumerations.length + ' Enumerations</li>';
        }

        if (this.enumerationMembers.length !== 0) {
            html += '<li>' + this.enumerationMembers.length + ' Enumeration Members</li>';
        }

        if (this.dataTypes.length !== 0) {
            html += '<li>' + dataTypes.length + ' Data Types</li>';
        }

        html += '</ul>';
        return html;
    }
}

module.exports = SDOVocabBrowser;