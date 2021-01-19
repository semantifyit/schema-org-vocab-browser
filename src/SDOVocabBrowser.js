import SDOAdapter from 'schema-org-adapter';

import Util from './Util';
import ListRenderer from './ListRenderer';
import VocabRenderer from './VocabRenderer';
import ClassRenderer from './ClassRenderer';
import PropertyRenderer from './PropertyRenderer';
import EnumerationRenderer from './EnumerationRenderer';
import EnumerationMemberRenderer from './EnumerationMemberRenderer';
import DataTypeRenderer from './DataTypeRenderer';

/**
 * The 2 different types of the vocabulary browser.
 *
 * @type {{VOCAB: string, LIST: string}}
 */
const BROWSER_TYPES = {
    VOCAB: 'VOCAB',
    LIST: 'LIST'
};

/**
 * The SDOVocabBrowser is a JS-Class that represents the interface between the user and this library.
 * After the constructor was called, the 'render' method can be used to render the vocab browser.
 */
class SDOVocabBrowser {
    /**
     * Create a SDOVocabBrowser object.
     *
     * @param {Element} elem - The HTML element in which the vocab browser will be rendered.
     * @param {string|object} vocabOrList - Can be one of the following:
     * - a vocabulary based on the schema.org vocabulary
     * (see: https://github.com/semantifyit/schema-org-adapter/blob/master/docu/vocabulary.md)
     * - a list based on semantify.it specifications (see: https://semantify.it/documentation/lists)
     * The data type of the vocabulary or the list must be either a JSON-LD object, a string which represents a JSON-LD
     * document or an IRI which points to a JSON-LD document.
     * @param {string} type - The type of the browser, either 'VOCAB' (default) or 'LIST'.
     */
    constructor(elem, vocabOrList, type = BROWSER_TYPES.VOCAB) {
        this.elem = elem;
        this.vocabOrList = vocabOrList;
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

    /**
     * Render the vocab browser in the specified HTML element.
     * This is the only method which should be called by the client.
     *
     * @returns {Promise<void>} A 'void' Promise to indicate the process ending.
     */
    async render() {
        this.elem.innerHTML =
            '<img src="https://raw.githubusercontent.com/semantifyit/schema-org-vocab-browser/main/images/loading.gif" '
            + 'alt="Loading Animation" style="margin-top: 6px">';

        await this.init();
        if (this.isListRendering()) {
            this.listRenderer.render();
        } else if (this.isVocabRendering()) {
            const searchParams = new URLSearchParams(window.location.search);
            const format = searchParams.get('format');
            if (format && format === 'jsonld') {
                this.vocabRenderer.renderJsonld();
            } else {
                this.vocabRenderer.render();
            }
        } else if (this.isTermRendering()) {
            this.renderTerm();
        }

        this.addJSLinkEventListener();
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }

    /**
     * Initialize either the list, the vocabulary or both.
     *
     * @returns {Promise<void>} A 'void' Promise to indicate the process ending.
     */
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

    /**
     * Check if the list needs initialization.
     *
     * @returns {boolean} 'true' if list needs initialization.
     */
    listNeedsInit() {
        return (this.type === BROWSER_TYPES.LIST && !this.list);
    }

    /**
     * Initialize the list.
     *
     * @returns {Promise<void>} A 'void' Promise to indicate the process ending.
     */
    async initList() {
        this.list = await this.util.parseToObject(this.vocabOrList);
    }

    /**
     * Check if the vocabulary needs initialization.
     *
     * @returns {boolean} 'true' if no vocabulary was initialized so far or a new vocabulary was selected in the list.
     */
    vocabNeedsInit() {
        const searchParams = new URLSearchParams(window.location.search);
        const vocUID = searchParams.get('voc');
        return ((this.type === BROWSER_TYPES.LIST && vocUID && vocUID !== this.vocUID) ||
            (this.type === BROWSER_TYPES.VOCAB && !this.vocab));
    }

    /**
     * Initialize the vocabulary (initializing a new SDOAdapter is part of this step).
     *
     * @returns {Promise<void>} A 'void' Promise to indicate the process ending.
     */
    async initVocab() {
        if (this.type === BROWSER_TYPES.VOCAB) {
            this.vocab = await this.util.parseToObject(this.vocabOrList);
        } else if (this.type === BROWSER_TYPES.LIST) {
            const searchParams = new URLSearchParams(window.location.search);
            this.vocUID = searchParams.get('voc');
            for (const part of this.list['schema:hasPart']) {
                const id = part['@id'];
                if (id.split('/').pop() === this.vocUID) {
                    this.vocab = await this.util.parseToObject(id);
                    this.vocName = part['schema:name'];
                    break;
                }
            }
        }

        await this.initSDOAdapter();
    }

    /**
     * Initialize the SDOAdapter with the latest schema.org vocabulary and the given/selected vocabulary.
     *
     * @returns {Promise<void>} A 'void' Promise to indicate the process ending.
     */
    async initSDOAdapter() {
        this.sdoAdapter = new SDOAdapter();
        const sdoURL = await this.sdoAdapter.constructSDOVocabularyURL('latest');
        await this.sdoAdapter.addVocabularies([sdoURL, this.vocab]);

        this.namespaces = this.sdoAdapter.getVocabularies();
        delete this.namespaces['schema'];
        const vocabNames = Object.keys(this.namespaces);

        this.classes = this.sdoAdapter.getListOfClasses({fromVocabulary: vocabNames});
        this.properties = this.sdoAdapter.getListOfProperties({fromVocabulary: vocabNames});
        this.enumerations = this.sdoAdapter.getListOfEnumerations({fromVocabulary: vocabNames});
        this.enumerationMembers = this.sdoAdapter.getListOfEnumerationMembers({fromVocabulary: vocabNames});
        this.dataTypes = this.sdoAdapter.getListOfDataTypes({fromVocabulary: vocabNames});
    }

    /**
     * Check if the list should be rendered.
     *
     * @returns {boolean} 'true' if the list should be rendered.
     */
    isListRendering() {
        const searchParams = new URLSearchParams(window.location.search);
        return (this.type === BROWSER_TYPES.LIST && !searchParams.get('voc'));
    }

    /**
     * Checks if the vocabulary should be rendered.
     *
     * @returns {boolean} 'true' if the vocabulary should be rendered.
     */
    isVocabRendering() {
        const searchParams = new URLSearchParams(window.location.search);
        return ((this.type === BROWSER_TYPES.LIST && searchParams.get('voc') && !searchParams.get('term')) ||
            (this.type === BROWSER_TYPES.VOCAB && !searchParams.get('term')));
    }

    /**
     * Check if a term should be rendered.
     *
     * @returns {boolean} 'true' if a term should be rendered.
     */
    isTermRendering() {
        const searchParams = new URLSearchParams(window.location.search);
        return (searchParams.get('term') !== null);
    }

    /**
     * Render a term.
     */
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
    }

    /**
     * Add an 'EventListener' to every JavaScript link in the HTML element.
     * Depending on the user action, the link will either open a new window or trigger the 'render' method.
     */
    addJSLinkEventListener() {
        const aJSLinks = this.elem.getElementsByClassName('a-js-link');

        for (const aJSLink of aJSLinks) { // forEach() not possible ootb for HTMLCollections
            aJSLink.addEventListener('click', async (event) => {
                if (event.ctrlKey) {
                    window.open(aJSLink.href);
                } else {
                    history.pushState(null, null, aJSLink.href);
                    await this.render();
                }
            });
        }
    }
}

module.exports = SDOVocabBrowser;
