const SDOAdapter = require('schema-org-adapter');

const Util = require('./Util');
const ListRenderer = require('./ListRenderer');
const VocabRenderer = require('./VocabRenderer');
const ClassRenderer = require('./ClassRenderer');
const PropertyRenderer = require('./PropertyRenderer');
const EnumerationRenderer = require('./EnumerationRenderer');
const EnumerationMemberRenderer = require('./EnumerationMemberRenderer');
const DataTypeRenderer = require('./DataTypeRenderer');

const TYPES = {
    VOCAB: 'VOCAB',
    LIST: 'LIST'
};

class SDOVocabBrowser {
    constructor(elem, vocabOrVocabList, type = TYPES.VOCAB) {
        this.elem = elem;
        this.vocabOrVocabList = vocabOrVocabList;
        this.type = type;

        this.util = new Util(this);
        this.listRenderer = new ListRenderer(this);
        this.vocabRenderer = new VocabRenderer(this);
        this.classRenderer = new ClassRenderer(this);
        this.propertyRenderer = new PropertyRenderer(this);
        this.enumerationRenderer = new EnumerationRenderer(this);
        this.enumerationMemberRenderer = new EnumerationMemberRenderer(this);
        this.dataTypeRenderer = new DataTypeRenderer(this);

        window.addEventListener('popstate', async () => {
            await this.render();
        });
    }

    async render() {
        await this.init();

        if (this.isListRendering()) {
            this.listRenderer.render();
        } else if (this.isVocabRendering()) {
            this.vocabRenderer.render();
        } else if (this.isTermRendering()) {
            this.renderTerm();
        }

        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }

    async init() {
        // Init list
        if (this.listNeedsInit()) {
            await this.initList();
        }

        // Init vocab
        if (this.vocabNeedsInit()) {
            await this.initVocab();
        }
    }

    listNeedsInit() {
        return (this.type === TYPES.LIST && !this.list);
    }

    async initList() {
        let jsonString;
        if (this.isValidUrl(this.vocabOrVocabList)) {
            jsonString = await this.get(this.vocabOrVocabList);
        } else {
            jsonString = this.vocabOrVocabList;
        }
        this.list = JSON.parse(jsonString);
    }

    isValidUrl(string) {
        try {
            new URL(string);
        } catch (_) {
            return false;
        }

        return true;
    }

    get(url) {
        return new Promise(function (resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
        });
    }

    vocabNeedsInit() {
        const searchParams = new URLSearchParams(window.location.search);
        const listNumber = searchParams.get('voc');
        return ((this.type === TYPES.LIST && listNumber && listNumber !== this.listNumber) ||
            (this.type === TYPES.VOCAB && !this.vocabs));
    }

    async initVocab() {
        let vocab;
        if (this.type === TYPES.VOCAB) {
            vocab = this.vocabOrVocabList;
        } else if (this.type === TYPES.LIST) {
            const searchParams = new URLSearchParams(window.location.search);
            this.listNumber = searchParams.get('voc');
            vocab = this.list['schema:hasPart'][this.listNumber - 1]['@id'];
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

    isListRendering() {
        const searchParams = new URLSearchParams(window.location.search);
        return (this.type === TYPES.LIST && !searchParams.get('voc'));
    }

    isVocabRendering() {
        const searchParams = new URLSearchParams(window.location.search);
        return ((this.type === TYPES.LIST && searchParams.get('voc') && !searchParams.get('term')) ||
            (this.type === TYPES.VOCAB && !searchParams.get('term')));
    }

    isTermRendering() {
        const searchParams = new URLSearchParams(window.location.search);
        return searchParams.get('term');
    }

    renderTerm() {
        const searchParams = new URLSearchParams(window.location.search);
        this.term = this.sdoAdapter.getTerm(searchParams.get('term'));

        let html;
        switch (this.term.getTermType()) {
            case 'rdfs:Class':
                html = this.classRenderer.render();
                break;
            case 'rdf:Property':
                html = this.propertyRenderer.render();
                break;
            case 'schema:Enumeration':
                html = this.enumerationRenderer.render();
                break;
            case 'soa:EnumerationMember':
                html = this.enumerationMemberRenderer.render();
                break;
            case 'schema:DataType':
                html = this.dataTypeRenderer.render();
                break;
        }
        this.util.addTermEventListener();
    }
}

module.exports = SDOVocabBrowser;
