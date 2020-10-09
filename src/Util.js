class Util {
    constructor(browser) {
        this.browser = browser;
    }

    async parseToObject(variable) {
        if (this.isString(variable)) {
            let jsonString;
            if (this.isValidUrl(variable)) {
                jsonString = await this.get(variable);
            } else {
                jsonString = variable;
            }
            return JSON.parse(jsonString);
        } else {
            return variable;
        }
    }

    isString(myVar) {
        return (typeof myVar === 'string' || myVar instanceof String);
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
            xhr.setRequestHeader('Accept', 'application/ld+json');
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

    createIRIwithQueryParam(key, val) {
        const searchParams = new URLSearchParams(window.location.search);
        (val && val !== '') ? searchParams.set(key, val) : searchParams.delete(key);
        const queryString = searchParams.toString();
        return window.location.origin + window.location.pathname + (queryString !== '' ? '?' + queryString : '');
    }

    createTableRow(typeOf, resource, mainColProp, mainColTermOrLink, sideCols, mainColClass = null) {
        return '' +
            '<tr typeof="' + typeOf + '" resource="' + resource + '">' +
            this.createMainColEntry(mainColProp, mainColTermOrLink, mainColClass) +
            sideCols +
            '</tr>';
    }

    createMainColEntry(property, link, className = null) {
        return '' +
            '<th' + (className ? ' class="' + className + '"' : '') + ' scope="row">' +
            this.createCodeLink(link, {'property': property}) +
            '</th>';
    }

    createCodeLink(termOrLink, codeAttr = null, linkAttr = null, rdfa = null) {
        return '' +
            '<code' + this.createHTMLAttr(codeAttr) + '>' +
            this.createFullLink(termOrLink, linkAttr, rdfa) +
            '</code>';
    }

    createFullLink(termOrLink, linkAttr, rdfa) {
        let term = null;
        try {
            term = this.browser.sdoAdapter.getTerm(termOrLink);
        } catch (e) {
        }
        return '' +
            (rdfa ? this.createSemanticLink(rdfa, termOrLink) : '') +
            (term ? this.createLink(termOrLink, linkAttr) : termOrLink);
    }

    createJSLink(queryKey, queryVal, text = null, attr = null) {
        return '<a ' + this.createAttrForJSLink(queryKey, queryVal, attr) + '>' +
            (text ? this.escHTML(text) : this.escHTML(queryVal)) + '</a>';
    }

    createAttrForJSLink(queryKey, queryVal, attr = null) {
        const iri = this.createIRIwithQueryParam(queryKey, queryVal);
        return 'class="a-js-link" href="' + this.escHTML(iri) + '" onclick="return false;"' +
            this.createHTMLAttr(attr);
    }

    escHTML(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     *
     * @param {object|null} attr
     * @returns {string}
     */
    createHTMLAttr(attr) {
        if (attr) {
            return Object.entries(attr).map((a) => {
                return ' ' + this.escHTML(a[0]) + '="' + this.escHTML(a[1]) + '"';
            }).join('');
        } else {
            return '';
        }
    }

    createExternalLink(href, text = null, attr = null) {
        return '<a href="' + this.escHTML(href) + '" target="_blank"' + this.createHTMLAttr(attr) + '>' +
            (text ? this.prettyPrintURI(text) : this.prettyPrintURI(href)) + '</a>';
    }

    prettyPrintURI(uri) {
        const schema = 'schema:';
        if (uri.startsWith(schema)) {
            return uri.substring(schema.length)
        }
        return this.escHTML(uri);
    }

    createMainContent(typeOf, mainContent) {
        return '' +
            '<div id="mainContent" vocab="http://schema.org/" typeof="' + typeOf + '" resource="' + window.location +
            '">' +
            mainContent +
            '</div>';
    }

    underscore(text) {
        return text.replace(/ /g, '_');
    }

    /**
     *
     * @param term
     * @param {string} superTypeFunc
     * @returns {[][]|null}
     */
    getTypeStructures(term, superTypeFunc = 'getSuperClasses') {
        const superTypes = term[superTypeFunc](false);
        if (superTypes.length === 0) {
            return [[term.getIRI(true)]];
        } else {
            let ret = [];
            superTypes.forEach((s) => {
                const newTerm = this.browser.sdoAdapter.getTerm(s);
                const newSuperTypes = this.getTypeStructures(newTerm, superTypeFunc);
                newSuperTypes.forEach((n) => {
                    n.push(term.getIRI(true));
                    ret.push(n);
                });
            });
            return ret;
        }
    }

    createHeader(superTypes, superTypeRelationship, breadCrumbStart = '', breadCrumbEnd = '') {
        const term = this.browser.term;
        return '' +
            (this.browser.vocName ? '<span style="float: right;">' +
                '(Vocabulary: ' + this.createJSLink('term', null, this.browser.vocName) + ')' +
                '</span>' : '') +
            '<h1 property="rdfs:label" class="page-title">' + term.getIRI(true) + '</h1>' +
            this.createSuperTypeBreadcrumbs(superTypes, superTypeRelationship, breadCrumbStart, breadCrumbEnd) +
            '</h4>' +
            '<div property="rdfs:comment">' + (term.getDescription() || '') + '<br><br></div>';
    }

    createSuperTypeBreadcrumbs(superTypes, superTypeRelationship, breadCrumbStart, breadCrumbEnd) {
        if (superTypes) {
            return '' +
                '<h4>' +
                superTypes.map((s) => {
                    return '' +
                        '<span class="breadcrumbs">' +
                        breadCrumbStart +
                        s.map((superType, i) => {
                            let html = '';
                            if ((breadCrumbEnd === '' && (i + 2) === s.length) ||
                                (breadCrumbEnd !== '' && (i + 1) === s.length)) {
                                html += this.createSemanticLink(superTypeRelationship, superType);
                            }
                            html += this.createLink(superType);
                            return html;
                        }).join(' > ') +
                        breadCrumbEnd +
                        '</span>';
                }).join('<br>') +
                '</h4>';
        }
        return '';
    }

    createSemanticLink(property, term) {
        return '<link property="' + this.escHTML(property) + '" href="' + this.escHTML(this.createHref(term)) + '">';
    }

    createHref(term) {
        if (this.isTermOfVocab(term)) {
            return this.createIRIwithQueryParam('term', term);
        } else {
            return this.browser.sdoAdapter.getTerm(term).getIRI();
        }
    }

    isTermOfVocab(term) {
        return (this.browser.vocab && (
            this.browser.classes.includes(term) ||
            this.browser.properties.includes(term) ||
            this.browser.enumerations.includes(term) ||
            this.browser.enumerationMembers.includes(term) ||
            this.browser.dataTypes.includes(term)
        ));
    }

    createLink(term, attr = null) {
        if (this.isTermOfVocab(term)) {
            return this.createJSLink('term', term, null, attr);
        } else {
            return this.createExternalLink(this.createHref(term), term, attr);
        }
    }

    createPropertyTableRow(p, onlyDomainIncludes = false) {
        return this.createTableRow('rdfs:Property',
            this.createHref(p),
            'rdfs:label',
            this.createLink(p),
            this.createPropertySideCols(p, onlyDomainIncludes),
            'prop-name');
    }

    createPropertySideCols(property, onlyDomainIncludes) {
        const sdoProperty = this.browser.sdoAdapter.getProperty(property);
        return '' +
            '<td class="prop-etc">' + this.createPropertyRange(sdoProperty, onlyDomainIncludes) + '</td>' +
            '<td class="prop-desc" property="rdfs:comment">' + (sdoProperty.getDescription() || '') + '</td>';
    }

    createPropertyRange(sdoProperty, onlyDomainIncludes) {
        let expectedType = '';
        const separator = '&nbsp; or <br>';
        if (!onlyDomainIncludes) {
            expectedType = sdoProperty.getRanges(false).map((p) => {
                return this.createSemanticLink('rangeIncludes', p) + this.createLink(p);
            }).join(separator);
        }
        const domainIncludes = sdoProperty.getDomains(false).map((d) => {
            return this.createSemanticLink('domainIncludes', d) +
                (onlyDomainIncludes ? this.createLink(d) : '');
        }).join(onlyDomainIncludes ? separator : '');
        return expectedType + domainIncludes;
    }

    createDefinitionTable(ths, trs) {
        if (!Array.isArray(ths)) {
            ths = [ths];
        }
        if (!Array.isArray(trs)) {
            trs = [trs];
        }
        return '' +
            '<table class="definition-table">' +
            '<thead>' +
            '<tr>' +
            ths.map((th) => {
                return '<th>' + th + '</th>';
            }).join('') +
            '</tr>' +
            '</thead>' +
            '<tbody>' +
            (trs[0].startsWith('<tr') ? trs.join('') : trs.map((tr) => {
                return '<tr>' + tr + '</tr>';
            }).join('')) +
            '</tbody>' +
            '</table>';
    }

    createRangesOf(isForEnumMember = false) {
        const rangeOf = this.browser.term.isRangeOf(false);
        if (rangeOf.length !== 0) {
            const trs = rangeOf.map((r) => {
                return this.createPropertyTableRow(r, true);
            });

            return '' +
                '<div id="incoming">' +
                'Instances of ' + this.createLink(this.browser.term.getIRI(true)) +
                (isForEnumMember ? ' and its enumeration members or subtypes' : '') +
                ' may appear as a value for the following properties' +
                '</div>' +
                '<br>' +
                this.createDefinitionTable(['Property', 'On Types', 'Description'], trs);
        } else {
            return '';
        }
    }
}

module.exports = Util;
