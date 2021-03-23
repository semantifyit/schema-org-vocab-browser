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
 * The SDOVocabBrowser is a JS-Class that represents the interface between the user and this library.
 * After the constructor was called, the 'render' method can be used to render the vocab browser.
 */
class SDOVocabBrowser {
    constructor(params) {
        this.vocabCache = {}; // cache for already fetched Vocabs - if already opened Vocab is viewed, it has not to be fetched again
        this.util = new Util(this);
        this.listRenderer = new ListRenderer(this);
        this.vocabRenderer = new VocabRenderer(this);
        this.classRenderer = new ClassRenderer(this);
        this.propertyRenderer = new PropertyRenderer(this);
        this.enumerationRenderer = new EnumerationRenderer(this);
        this.enumerationMemberRenderer = new EnumerationMemberRenderer(this);
        this.dataTypeRenderer = new DataTypeRenderer(this);
        // Initialize mandatory parameters from constructor
        this.targetElement = params.targetElement;
        this.locationControl = params.locationControl !== false;
        this.selfFileHost = params.selfFileHost === true; // if this is true, the list and vocab files are being fetched from the same host where the vocab browser is being served (e.g. to make localhost/staging work). Makes only sense if locationControl = true
        // Initialize parameters depending on locationControl
        if (this.locationControl) {
            this.readStateFromUrl();
        } else {
            this.listId = params.listId || null;
            this.vocId = params.vocId || null;
            this.termURI = params.termURI || null;
            this.format = params.format || null;
        }
        // Add listener for navigation back button
        if (this.locationControl) {
            window.addEventListener('popstate', async() => {
                this.readStateFromUrl();
                await this.render();
            });
        }
    }

    /**
     * Render the vocab browser in the specified HTML element.
     * This is the only method which should be called by the client.
     *
     * @returns {Promise<void>} A 'void' Promise to indicate the process ending.
     */
    async render() {
        this.targetElement.innerHTML =
            `<img src="https://raw.githubusercontent.com/semantifyit/schema-org-vocab-browser/main/images/loading.gif"
            alt="Loading Animation" style="margin-top: 6px">`;

        await this.renderInit();
        if (this.listId && !this.vocId) {
            this.listRenderer.render();
        } else if (this.vocId && !this.termURI) {
            if (this.format === "jsonld") {
                this.vocabRenderer.renderJsonld();
            } else {
                this.vocabRenderer.render();
            }
        } else if (this.termURI) {
            this.renderTerm();
        }

        this.addJSLinkEventListener();
        this.addSectionLinkEventListener();
        document.body.scrollTop = document.documentElement.scrollTop = 0;
    }

    /**
     * Initialize either the list, the vocabulary or both.
     *
     * @returns {Promise<void>} A 'void' Promise to indicate the process ending.
     */
    async renderInit() {
        // Init list
        if (this.listId && (!this.list || !this.list["@id"].endsWith(this.listId))) {
            this.list = await this.util.parseToObject(this.util.getFileHost() + "/list/" + this.listId + "?representation=lean");
        }
        // Init vocab
        if (this.vocId && (!this.vocab || !this.vocab["@id"].endsWith(this.vocId))) {
            await this.initVocab();
        }
    }

    /**
     * Initialize the vocabulary (initializing a new SDOAdapter is part of this step).
     *
     * @returns {Promise<void>} A 'void' Promise to indicate the process ending.
     */
    async initVocab() {
        if (!this.vocabCache[this.vocId]) {
            const vocab = await this.util.parseToObject(this.util.getFileHost() + "/voc/" + this.vocId);
            // Create a new SDO Adapter for each vocabulary file, save it in the cache
            const newSdoAdapter = new SDOAdapter();
            const sdoURL = await newSdoAdapter.constructSDOVocabularyURL('latest');
            await newSdoAdapter.addVocabularies([sdoURL, vocab]);
            this.vocabCache[this.vocId] = {
                vocabFile: vocab,
                sdoAdapter: newSdoAdapter
            };
        }
        this.vocab = this.vocabCache[this.vocId].vocabFile;
        this.sdoAdapter = this.vocabCache[this.vocId].sdoAdapter;
        this.namespaces = this.sdoAdapter.getVocabularies();
        delete this.namespaces['schema'];
        const vocabNames = Object.keys(this.namespaces);
        this.classes = this.sdoAdapter.getListOfClasses({fromVocabulary: vocabNames});
        this.properties = this.sdoAdapter.getListOfProperties({fromVocabulary: vocabNames});
        this.enumerations = this.sdoAdapter.getListOfEnumerations({fromVocabulary: vocabNames});
        this.enumerationMembers = this.sdoAdapter.getListOfEnumerationMembers({fromVocabulary: vocabNames});
        this.dataTypes = this.sdoAdapter.getListOfDataTypes({fromVocabulary: vocabNames});
    }

    getVocabName() {
        if (this.vocab && this.list) {
            const vocabAsListItem = this.list['schema:hasPart'].find(e => e["@id"].split('/').pop() === this.vocId);
            if (vocabAsListItem) {
                return vocabAsListItem['schema:name'];
            }
        }
        return "";
    }

    /**
     * Render a term.
     */
    renderTerm() {
        this.term = this.sdoAdapter.getTerm(this.termURI);
        switch (this.term.getTermType()) {
            case 'rdfs:Class':
                this.classRenderer.render();
                break;
            case 'rdf:Property':
                this.propertyRenderer.render();
                break;
            case 'schema:Enumeration':
                this.enumerationRenderer.render();
                break;
            case 'soa:EnumerationMember':
                this.enumerationMemberRenderer.render();
                break;
            case 'schema:DataType':
                this.dataTypeRenderer.render();
                break;
        }
    }

    /**
     * Add an 'EventListener' to every JavaScript link in the HTML element.
     * Depending on the user action, the link will either open a new window or trigger the 'render' method.
     */
    addJSLinkEventListener() {
        const aJSLinks = this.targetElement.getElementsByClassName('a-js-link');
        for (const aJSLink of aJSLinks) { // forEach() not possible ootb for HTMLCollections
            aJSLink.addEventListener('click', async(event) => {
                if (this.locationControl) {
                    if (event.ctrlKey) {
                        window.open(aJSLink.href);
                    } else {
                        history.pushState(null, null, aJSLink.href);
                        this.navigate(JSON.parse(decodeURIComponent(aJSLink.getAttribute("data-state-changes"))));
                    }
                } else {
                    this.navigate(JSON.parse(decodeURIComponent(aJSLink.getAttribute("data-state-changes"))));
                }
            });
        }
    }

    addSectionLinkEventListener() {
        const aJSLinks = this.targetElement.getElementsByClassName('a-section-link');
        for (const aJSLink of aJSLinks) { // forEach() not possible ootb for HTMLCollections
            aJSLink.addEventListener('click', async(event) => {
                if (this.locationControl) {
                    if (event.ctrlKey) {
                        window.open(aJSLink.href);
                    } else {
                        history.pushState(null, null, aJSLink.href);
                        this.scrollToSection(decodeURIComponent(aJSLink.getAttribute("data-section-link")));
                    }
                } else {
                    this.scrollToSection(decodeURIComponent(aJSLink.getAttribute("data-section-link")));
                }
            });
        }
    }

    navigate(newState) {
        if (newState.listId !== undefined) {
            this.listId = newState.listId;
        }
        if (newState.vocId !== undefined) {
            this.vocId = newState.vocId;
        }
        if (newState.termURI !== undefined) {
            this.termURI = newState.termURI;
        }
        if (newState.format !== undefined) {
            this.format = newState.format;
        }
        // If there is no listId, there shall be no list
        if (this.listId === null) {
            this.list = undefined;
        }
        // If there is no vocId, there shall be no vocab
        if (this.vocId === null) {
            this.vocab = undefined;
        }
        // If there is no vocab, there shall be no termURI
        if (!this.vocab) {
            this.termURI = null;
        }
        // The navigate() function will always lead to a new page -> reset the # anchor set in the URL
        if (this.locationControl) {
            history.replaceState(null, null, ' ');
        }
        this.render();
    }

    scrollToSection(sectionId) {
        sectionId = this.util.underscore(sectionId);
        const allowedSections = ["Classes", "Properties", "Enumerations", "Enumeration_Members", "Data_Types"];
        if (!allowedSections.includes(sectionId)) {
            return;
        }
        window.scrollTo({
            top: window.pageYOffset + document.getElementById(sectionId).getBoundingClientRect().top,
            left: 0,
            behavior: 'smooth'
        });
    }

    readStateFromUrl() {
        const searchParams = new URLSearchParams(window.location.search);
        this.format = searchParams.get('format') || null;
        this.termURI = searchParams.get('term') || null;
        if (window.location.pathname.includes("/voc/")) {
            this.listId = null;
            let vocabId = window.location.pathname.substring("/voc/".length);
            if (this.vocId !== vocabId) {
                this.vocId = vocabId;
                this.vocab = null;
            }
        } else if (window.location.pathname.includes("/list/")) {
            let listId = window.location.pathname.substring("/list/".length);
            if (this.listId !== listId) {
                this.listId = listId;
                this.list = null;
            }
            let vocabId = searchParams.get('voc') || null;
            if (this.vocId !== vocabId) {
                this.vocId = vocabId;
                this.vocab = null;
            }
        } else {
            this.listId = null;
            this.list = null;
            this.vocId = null;
            this.vocab = null;
        }
    }
}

module.exports = SDOVocabBrowser;
