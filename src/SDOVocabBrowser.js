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

            this.vocabs = this.sdoAdapter.getVocabularies(this.vocabOrVocabList);
            delete this.vocabs['schema'];
            const vocabNames = Object.keys(this.vocabs);

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
        this.elem.innerHTML =
            this.generateHeading() +
            this.generateContentSection() +
            this.generateSection(this.classes, 'Classes') +
            this.generateSection(this.properties, 'Properties') +
            this.generateSection(this.enumerations, 'Enumerations') +
            this.generateSection(this.enumerationMembers, 'Enumeration Members') +
            this.generateSection(this.dataTypes, 'Data Types');
    }

    generateHeading() {
        return '' +
            '<h1>' +
                Object.entries(this.vocabs).map((vocab) => {return vocab[0] + ':' + vocab[1]}) +
            '</h1>';
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

    generateSection(objects, objectType) {
        let html = '';
        if (objects.length !== 0) {
             html += '' +
                 '<table>' +
                     '<thead>' +
                         '<tr>' +
                             '<th>' + objectType + '</th>' +
                             '<th>Description</th>' +
                         '</tr>' +
                     '</thead>' +
                     '<tbody>' +
                         this.generateTbody(objects) +
                     '</tbody>' +
                 '</table>'
        }

        return html;
    }

    generateTbody(objects) {
        return objects.map((name) => {
            return '' +
                '<tr>' +
                    '<td>' + name + '</td>' +
                    '<td>' + this.sdoAdapter.getTerm(name).getDescription() + '</td>' +
                '</tr>'
        }).join('');
    }
}

module.exports = SDOVocabBrowser;