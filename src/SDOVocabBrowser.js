const SDOAdapter = require('schema-org-adapter');
const util = require('./util.js');

const TYPES = {
    VOCAB: 'VOCAB',
    LIST: 'LIST'
};

class SDOVocabBrowser {
    constructor(elem, vocabOrVocabList, type=TYPES.VOCAB) {
        this.elem = elem;
        this.vocabOrVocabList = vocabOrVocabList;
        this.type = type;
        this.sdoAdapter = new SDOAdapter();
    }

    async init() {
        if (this.type === TYPES.VOCAB) {
            const sdoURL = await this.sdoAdapter.constructSDOVocabularyURL('latest', 'all-layers');
            // JSON or URL can both be parsed
            await this.sdoAdapter.addVocabularies([sdoURL, this.vocabOrVocabList]);

            this.vocabs = this.sdoAdapter.getVocabularies(this.vocabOrVocabList);
            delete this.vocabs['schema'];
            const vocabNames = Object.keys(this.vocabs);

            this.classes = this.sdoAdapter.getListOfClasses({fromVocabulary: vocabNames});
            this.properties = this.sdoAdapter.getListOfProperties({fromVocabulary: vocabNames});
            this.enumerations = this.sdoAdapter.getListOfEnumerations({fromVocabulary: vocabNames});
            this.enumerationMembers = this.sdoAdapter.getListOfEnumerationMembers({fromVocabulary: vocabNames});
            this.dataTypes = this.sdoAdapter.getListOfDataTypes({fromVocabulary: vocabNames});
        } else if (this.type === TYPES.LIST) {
            let jsonString;
            if (util.isValidUrl(this.vocabOrVocabList)) {
                jsonString = await util.get(this.vocabOrVocabList);
            } else {
                jsonString = this.vocabOrVocabList;
            }
            this.list = JSON.parse(jsonString);
        }
    }


    async generateHTML() {
        await this.init();

        if (this.type === TYPES.VOCAB) {
            this.elem.innerHTML =
                this.generateVocabHeading() +
                this.generateVocabContentSection() +
                this.generateVocabSection(this.classes, 'Classes') +
                this.generateVocabSection(this.properties, 'Properties') +
                this.generateVocabSection(this.enumerations, 'Enumerations') +
                this.generateVocabSection(this.enumerationMembers, 'Enumeration Members') +
                this.generateVocabSection(this.dataTypes, 'Data Types');
        } else if (this.type === TYPES.LIST) {
            this.elem.innerHTML = this.generateListTable();

        }
    }

    generateVocabHeading() {
        return '' +
            '<h1>' +
                Object.entries(this.vocabs).map((vocab) => {return vocab[0] + ':' + vocab[1]}) +
            '</h1>';
    }

    generateVocabContentSection() {
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

    generateVocabSection(objects, objectType) {
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
                         this.generateVocabTbody(objects) +
                     '</tbody>' +
                 '</table>'
        }

        return html;
    }

    generateVocabTbody(objects) {
        return objects.map((name) => {
            return '' +
                '<tr>' +
                    '<td>' + name + '</td>' +
                    '<td>' + this.sdoAdapter.getTerm(name).getDescription() + '</td>' +
                '</tr>'
        }).join('');
    }

    generateListTable() {
        return '' +
            '<table>' +
                '<thead>' +
                    '<tr>' +
                        '<th>Name</th>' +
                        '<th>IRI</th>' +
                        '<th>Author</th>' +
                        '<th>Description</th>' +
                    '</tr>' +
                '</thead>' +
                '<tbody>' +
                    this.generateListTbody() +
                '</tbody>' +
            '</table>'
    }

    generateListTbody() {
        console.log(this.list);
        return this.list['schema:hasPart'].map((vocab) => {
            return '' +
                '<tr>' +
                    '<td>' + /*TODO: vocab.name + */ '</td>' +
                    '<td><a target="_blank" href="' + vocab['@id'] + '">' + vocab['@id'] + '</a></td>' +
                    '<td>' + /*TODO: vocab.author + */ '</td>' +
                    '<td>' + /*TODO: vocab.description + */ '</td>' +
                '</tr>';
        }).join('');
    }
}

module.exports = SDOVocabBrowser;