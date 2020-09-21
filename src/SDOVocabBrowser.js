const SDOAdapter = require('schema-org-adapter');
const util = require('./util.js');

const TYPES = {
    VOCAB: 'VOCAB',
    LIST: 'LIST'
};

class SDOVocabBrowser {
    constructor(elem, vocabOrVocabList, type = TYPES.VOCAB) {
        this.elem = elem;
        this.vocabOrVocabList = vocabOrVocabList;
        this.type = type;

        window.addEventListener('popstate', async (e) => {
            await this.generateHTML();
        });
    }

    async generateHTML() {
        await this.init();

        if (this.isListRendering()) {
            this.generateList();
        } else if (this.isVocabRendering()) {
            this.generateVocab();
        } else if (this.isTermRendering()) {
            this.generateTerm();
        }
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
        if (util.isValidUrl(this.vocabOrVocabList)) {
            jsonString = await util.get(this.vocabOrVocabList);
        } else {
            jsonString = this.vocabOrVocabList;
        }
        this.list = JSON.parse(jsonString);
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

    generateList() {
        this.elem.innerHTML = '' +
            '<div id="mainContent" ' /*vocab="http://schema.org/"*/ + 'typeof="schema:DataSet" resource="' + window.location + '">' +
            this.generateListHeader() +
            this.generateListTable() +
            '</div';
        this.addListEventListener();
    }

    generateListHeader() {
        return '<h1>' + this.list['schema:name'] + '</h1>';
    }

    generateListTable() {
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
            this.generateListTbody() +
            '</tbody>' +
            '</table>'
    }

    generateListTbody() {
        return this.list['schema:hasPart'].map((vocab, i) => {
            return '' +
                this.generateTableRow('http://vocab.sti2.at/ds/Vocabulary',
                    util.createIRIwithQueryParam('voc', i + 1),
                    'schema:name',
                    util.createJSLink('a-vocab-name', 'voc', i + 1, 'TODO'),
                    this.generateListSideCols(vocab)
                );
        }).join('');
    }

    generateTableRow(typeOf, resource, mainColProp, link, sideCols, mainColClass=null) {
        return '' +
            '<tr typeof="' + typeOf  + '" resource="' + resource + '">' +
            this.generateMainColEntry(mainColProp, link, mainColClass) +
            sideCols +
            '</tr>';
    }

    generateMainColEntry(property, link, className=null) {
        return '' +
            '<th' + (className ? ' class="' + className + '"' : '') + ' scope="row">' +
            '<code property="' + property + '">' +
            link +
            '</code>' +
            '</th>';
    }

    generateListSideCols(vocab) {
        return '' +
            '<td property="@id">' + util.createExternalLink(vocab['@id']) + '</td>' +
            '<td property="schema:author">' + /*TODO: vocab.author + */ '</td>' +
            '<td property="schema:description">' + /*TODO: vocab.description + */ '</td>';
    }

    addListEventListener() {
        const aVocabNames = document.getElementsByClassName('a-vocab-name');

        for (let i = 0; i < aVocabNames.length; i++) { // forEach() not possible ootb for HTMLCollections
            const aVocabName = aVocabNames[i];
            aVocabName.addEventListener('click', async () => {
                history.pushState(null, null, util.createIRIwithQueryParam('voc', i + 1));
                await this.generateHTML();
            });
        }
    }

    generateVocab() {
        this.elem.innerHTML =
            '<div id="mainContent"' + /*vocab="http://schema.org/" + ' typeof="rdfs:Class"*/ +' resource="' + window.location + '">' +
            this.generateVocabHeading() +
            this.generateVocabContentSection() +
            this.generateVocabSection(this.classes, 'Class', 'Classes') +
            this.generateVocabSection(this.properties, 'Property', 'Properties') +
            this.generateVocabSection(this.enumerations, 'Enumeration', 'Enumerations') +
            this.generateVocabSection(this.enumerationMembers, 'Enumeration Member', 'Enumeration Members') +
            this.generateVocabSection(this.dataTypes, 'Data Type', 'Data Types') +
            '</div>';
        this.addTermEventListener();
    }

    generateVocabHeading() {
        return '' +
            '<h1>' +
            Object.entries(this.vocabs).map((vocab) => {
                return vocab[0] + ':' + vocab[1]
            }) +
            '</h1>';
    }

    generateVocabContentSection() {
        let html = '<h2>Content</h2>' +
            '<ul>';

        if (this.classes.length !== 0) {
            html += '<li>' + this.classes.length + ' Class' + (this.classes.length === 1 ? '' : 'es') + '</li>';
        }

        if (this.properties.length !== 0) {
            html += '<li>' + this.properties.length + ' Propert' + (this.properties.length === 1 ? 'y' : 'ies') + '</li>';
        }

        if (this.enumerations.length !== 0) {
            html += '<li>' + this.enumerations.length + ' Enumeration' + (this.enumerations.length === 1 ? '' : 's') + '</li>';
        }

        if (this.enumerationMembers.length !== 0) {
            html += '<li>' + this.enumerationMembers.length + ' Enumeration Member' + (this.enumerationMembers.length === 1 ? '' : 's') + '</li>';
        }

        if (this.dataTypes.length !== 0) {
            html += '<li>' + dataTypes.length + ' Data Type' + (this.dataTypes.length === 1 ? '' : 's') + '</li>';
        }

        html += '</ul>';
        return html;
    }

    generateVocabSection(objects, typeSingular, typePlural) {
        let html = '';
        if (objects.length !== 0) {
            html += '' +
                '<h2>' + typePlural + '</h2>' +
                '<table class="definition-table">' +
                '<thead>' +
                '<tr>' +
                '<th>' + typeSingular + '</th>' +
                '<th>Description</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody class="supertype">' +
                this.generateVocabSectionTbody(objects) +
                '</tbody>' +
                '</table>'
        }

        return html;
    }

    generateVocabSectionTbody(objects) {
        return objects.map((name) => {
            const term = this.sdoAdapter.getTerm(name);
            return this.generateTableRow(term.getTermType(),
                util.createIRIwithQueryParam('term', name),
                '@id',
                util.createJSLink('a-term-name', 'term', name),
                '<td property="rdfs:comment">' + term.getDescription() + '</td>');
        }).join('');
    }

    generateTerm() {
        const searchParams = new URLSearchParams(window.location.search);
        this.term = this.sdoAdapter.getTerm(searchParams.get('term'));

        let html;
        switch(this.term.getTermType()) {
            case 'rdfs:Class':
                html = '' +
                    '<div id="mainContent" vocab="http://schema.org/" typeof="rdfs:Class" resource="' + window.location + '">' +
                    this.generateHeader(this.term.getSuperClasses(), 'rdfs:subClassOf') +
                    this.generateClassProperties() +
                    '</div>';
                break;
            case 'rdf:Property':
                html = '' +
                    '<div id="mainContent" vocab="http://schema.org/" typeof="rdf:Property" resource="' + window.location + '">' +
                    this.generateHeader(this.term.getSuperProperties(), 'rdfs:subPropertyOf',
                        this.generatePropertyStartBreadcrumbs()) +
                    this.generatePropertyRanges() +
                    this.generatePropertyDomainIncludes() +
                    this.generatePropertySuperProperties() +
                    this.generatePropertySubProperties() +
                    '</div>'

        }
        this.elem.innerHTML = html;
        this.addTermEventListener();
    }

    generateHeader(superTypes, superTypeRelationship, breadCrumbStart='') {
        return '' +
            '<h1 property="rdfs:label" class="page-title">' + this.term.getIRI(true) + '</h1>' +
            '<h4>' +
            '<span class="breadcrumbs">' +
            breadCrumbStart +
            this.generateSuperTypeBreadcrumbs(superTypes, superTypeRelationship) +
            util.createJSLink('a-term-name', 'term', this.term.getIRI(true)) +
            '</span>' +
            '</h4>' +
            '<div property="rdfs:comment">' + this.term.getDescription() + '<br><br></div>';
    }

    generateSemanticLink(property, term) {
        return '<link property="' + property + '" href="' + this.generateHref(term) + '">';
    }

    generateHref(term) {
        if (this.isTermOfVocab(term)) {
            return util.createIRIwithQueryParam('term', term);
        } else {
            return this.sdoAdapter.getTerm(term).getIRI();
        }
    }

    isTermOfVocab(term) {
        return this.classes.includes(term) ||
            this.properties.includes(term) ||
            this.enumerations.includes(term) ||
            this.enumerationMembers.includes(term) ||
            this.dataTypes.includes(term);
    }

    generateLink(term, attr=null) {
        if (this.isTermOfVocab(term)) {
            return util.createJSLink('a-term-name', 'term', term, null, attr);
        } else {
            return util.createExternalLink(this.generateHref(term), term, attr);
        }
    }

    generateSuperTypeBreadcrumbs(superTypes, superTypeRelationship) {
        let html = '';
        if (superTypes) {
            superTypes.reverse().forEach((superType, i) => {
                if ((i + 1) === superTypes.length) {
                    html += this.generateSemanticLink(superTypeRelationship, superType);
                }
                html += this.generateLink(superType);
                html += ' > ';
            });
        }
        return html;
    }

    generateClassProperties() {
        let html = '<table class="definition-table">' +
            this.generateClassPropertiesHeader();

        const classes = [this.term, ...this.term.getSuperClasses().map((c) => this.sdoAdapter.getClass(c))];
        classes.forEach((c) => {
            const properties = c.getProperties(false);
            if (properties.length !== 0) {
                html += '<tbody>' +
                    this.generateClassPropertyHeader(c);
                properties.forEach((p) => {
                    html += this.generateTableRow('rdfs:Property',
                        this.generateHref(p),
                        'rdfs:label',
                        this.generateLink(p),
                        this.generatePropertySideCols(p),
                        'prop-name');
                });
                html += '</tbody>';
            }
        });
        html += '</table>' +
        '<br>'+
        this.generateClassSpecificTypes();

        return html;
    }

    generateClassPropertiesHeader() {
        return  '' +
            '<thead>' +
            '<tr>' +
            '<th>Property</th>' +
            '<th>Expected Type</th>' +
            '<th>Description</th>' +
            '</tr>' +
            '</thead>';
    }

    generateClassPropertyHeader(className) {
        return '' +
            '<tbody>' +
            '<tr class="supertype">' +
            '<th class="supertype-name" colspan="3">' +
            'Properties from ' + this.generateLink(className.getIRI(true)) +
            '</th>' +
            '</tr>' +
            '</tbody>';
    }

    generatePropertySideCols(property) {
        const sdoProperty = this.sdoAdapter.getProperty(property);
        return '' +
            '<td class="prop-etc">' + this.generateRange(sdoProperty) + '</td>' +
            '<td class="prop-desc" property="rdfs:comment">' + sdoProperty.getDescription() + '</td>';
    }

    generateRange(sdoProperty) {
        const expectedType = sdoProperty.getRanges(false).map((p) => {
            return this.generateSemanticLink('rangeIncludes', p) + this.generateLink(p);
        }).join('&nbsp; or <br>');
        const domainIncludes = sdoProperty.getDomains(false).map((d) => {
            return this.generateSemanticLink('domainIncludes', d);
        });
        return expectedType + domainIncludes;
    }

    generateClassSpecificTypes() {
        const subClasses = this.term.getSubClasses(false);
        if (subClasses.length !== 0) {
            return '' +
                '<b>' +
                '<a id="subtypes" title="Link: #subtypes" href="#subtypes" class="clickableAnchor">' +
                'More specific Types' +
                '</a>' +
                '</b>' +
                '<ul>' +
                subClasses.map((s) => {
                    return '<li>' + this.generateLink(s) + '</li>';
                }) +
                '</ul>' +
                '<br>';
        } else {
            return '';
        }
    }

    generatePropertyStartBreadcrumbs() {
        return '' +
            this.generateLink('schema:Thing') +
            " > " +
            this.generateLink('schema:Property', {'title': 'Defined in section: meta.schema.org'}) +
            " > ";
    }

    generatePropertyRanges() {
        return this.getPropertyDefinitionTable('Values expected to be one of these types',
            this.term.getRanges(false).map((r) => {
                return '' +
                    '<code>' +
                    this.generateSemanticLink('rangeIncludes', r) +
                    this.generateLink(r,
                        {'title': 'The \'' + this.term.getIRI(true) + '\' property has values that include ' +
                                'instances of the \'' + r + '\' type.'}) +
                    '</code>';
            }).join('<br>'));
    }

    getPropertyDefinitionTable(th, td) {
        return '' +
            '<table class="definition-table">' +
            '<thead>' +
            '<tr>' +
            '<th>' + th + '</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>' +
            '<tr>' +
            '<td>' + td + '</td>' +
            '</tr>' +
            '</tbody>' +
            '</table>';
    }

    generatePropertyDomainIncludes() {
        return this.getPropertyDefinitionTable('Used on these types',
            this.term.getDomains(false).map((d) => {
                return '' +
                    '<code>' +
                    this.generateSemanticLink('domainIncludes', d) +
                    this.generateLink(d,
                        {'title': 'The \'' + this.term.getIRI(true) + '\' property ' +
                                'is used on the \'' + d + '\' type'}) +
                    '</code>';
            }).join('<br>'));
    }

    generatePropertySuperProperties() {
        const superProperties = this.term.getSuperProperties(false);
        if (superProperties.length !== 0) {
            return this.getPropertyDefinitionTable('Super-properties',
                superProperties.map((s) => {
                    return '' +
                        '<code>' +
                        this.generateLink(s,
                            {'title': s + ': \'\'' + this.sdoAdapter.getProperty(s).getDescription() + '\'\''}) +
                        '</code>';
                }).join('<br>'));
        } else {
            return '';
        }
    }

    generatePropertySubProperties() {
        const subProperties = this.term.getSubProperties(false);
        if (subProperties.length !== 0) {
            return this.getPropertyDefinitionTable('Sub-properties',
                subProperties.map((s) => {
                    return '' +
                        '<code>' +
                        this.generateLink(s,
                            {'title': s + ': \'\'' + this.sdoAdapter.getProperty(s).getDescription() + '\'\''}) +
                        '</code>';
                }).join('<br>'));
        } else {
            return '';
        }
    }

    addTermEventListener() {
        const aTermNames = document.getElementsByClassName('a-term-name');

        for (const aTermName of aTermNames) { // forEach() not possible ootb for HTMLCollections
            aTermName.addEventListener('click', async () => {
                history.pushState(null, null, util.createIRIwithQueryParam('term', aTermName.innerText));
                await this.generateHTML();
            });
        }
    }
}

module.exports = SDOVocabBrowser;