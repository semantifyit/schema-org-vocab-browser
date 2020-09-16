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
        this.sdoAdapter = null;

        window.addEventListener('popstate', async (e) => {
            await this.generateHTML();
        });
    }

    async init() {
        // Init list
        if (this.type === TYPES.LIST && !this.list) {
            let jsonString;
            if (util.isValidUrl(this.vocabOrVocabList)) {
                jsonString = await util.get(this.vocabOrVocabList);
            } else {
                jsonString = this.vocabOrVocabList;
            }
            this.list = JSON.parse(jsonString)
        }

        // Init vocab
        if (this.isVocabRendering()) {
            await this.initVocab();
        }
    }

    isVocabRendering() {
        const searchParams = new URLSearchParams(window.location.search);
        return (this.type === TYPES.VOCAB || searchParams.get('voc'));
    }

    async initVocab() {
        let vocab;
        if (this.type === TYPES.VOCAB) {
            vocab = this.vocabOrVocabList;
        } else if (this.type === TYPES.LIST) {
            const searchParams = new URLSearchParams(window.location.search);
            const listNumber = searchParams.get('voc');
            vocab = this.list['schema:hasPart'][listNumber-1]['@id'];
        }

        this.sdoAdapter = new SDOAdapter();
        const sdoURL = await this.sdoAdapter.constructSDOVocabularyURL('latest', 'all-layers');
        // JSON or URL can both be parsed
        await this.sdoAdapter.addVocabularies([sdoURL, vocab]);

        this.vocabs = this.sdoAdapter.getVocabularies(vocab);
        delete this.vocabs['schema'];
        const vocabNames = Object.keys(this.vocabs);

        this.classes = this.sdoAdapter.getListOfClasses({fromVocabulary: vocabNames});
        this.properties = this.sdoAdapter.getListOfProperties({fromVocabulary: vocabNames});
        this.enumerations = this.sdoAdapter.getListOfEnumerations({fromVocabulary: vocabNames});
        this.enumerationMembers = this.sdoAdapter.getListOfEnumerationMembers({fromVocabulary: vocabNames});
        this.dataTypes = this.sdoAdapter.getListOfDataTypes({fromVocabulary: vocabNames});
    }

    async generateHTML() {
        await this.init();

        if (this.isVocabRendering()) {
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
            this.addListEventListener();
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
        return this.list['schema:hasPart'].map((vocab, i) => {
            return '' +
                '<tr>' +
                    '<td><a class="a-vocab-name" href="?voc=' + (i + 1) + '" onclick="return false;">TODO</a></td>' +
                    '<td><a target="_blank" href="' + vocab['@id'] + '">' + vocab['@id'] + '</a></td>' +
                    '<td>' + /*TODO: vocab.author + */ '</td>' +
                    '<td>' + /*TODO: vocab.description + */ '</td>' +
                '</tr>';
        }).join('');
    }

    addListEventListener() {
        const aVocabNames = document.getElementsByClassName('a-vocab-name');

        for (let i = 0; i < aVocabNames.length; i++) { // forEach() not possible ootb for HTMLCollections
            const aVocabName = aVocabNames[i];
            aVocabName.addEventListener('click', async () => {
                history.pushState(null, null, util.addQueryParam('voc', i + 1));
                await this.generateHTML();
            });
        }
    }
}

module.exports = SDOVocabBrowser;