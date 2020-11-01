/** This class provides helper methods and common methods for the other classes. */
class Util {
    /**
     * Create a Util object.
     *
     * @param {SDOVocabBrowser} browser - the underlying vocab browser to enable access to its data members.
     */
    constructor(browser) {
        this.browser = browser;
    }

    /**
     * Parse a variable to a JSON object.
     *
     * @param {string|object} variable - The variable that should be parsed.
     * Can be either a JSON object, a string which represents a JSON document or an IRI which points to a JSON document.
     * @returns {Promise<object>} A Promise with the parsed JSON object.
     */
    async parseToObject(variable) {
        if (this.isString(variable)) {
            /**
             * @type string
             */
            let jsonString;
            if (this.isValidUrl(variable)) {
                jsonString = await this.getJsonld(variable);
            } else {
                jsonString = variable;
            }
            return JSON.parse(jsonString);
        } else {
            return variable;
        }
    }

    /**
     * Check if a variable is a string.
     *
     * @param {*} variable - The variable that should be checked.
     * @returns {boolean} 'true' if the variable is a string.
     */
    isString(variable) {
        return (typeof variable === 'string' || variable instanceof String);
    }

    /**
     * Check if a string represents a valid URL.
     *
     * @param {string} string - The variable that should be checked.
     * @returns {boolean} 'true' if the string represents a valid URL.
     */
    isValidUrl(string) {
        try {
            new URL(string);
        } catch (_) {
            return false;
        }
        return true;
    }

    /**
     * Retrieve the JSON-LD content of an URL.
     *
     * @param {string} url - The url.
     * @returns {Promise<string|object>} A Promise with either the JSON-LD content of the URL or an error object.
     */
    getJsonld(url) {
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

    /**
     * Create an IRI with the current browser IRI and the given query parameter.
     * The query parameter can be either set, overwritten or deleted.
     *
     * @param {string} key - The query parameter key.
     * @param {string} val - The query parameter values.
     * @returns {string} The resulting IRI.
     */
    createIriWithQueryParam(key, val) {
        const searchParams = new URLSearchParams(window.location.search);
        (val && val !== '') ? searchParams.set(key, val) : searchParams.delete(key);
        const queryString = searchParams.toString();
        const origin = window.location.protocol + '//' + (window.location.host ? window.location.host : '');
        return origin + window.location.pathname + (queryString !== '' ? '?' + queryString : '');
    }

    /**
     * Create a HTML table row with RDFa (https://en.wikipedia.org/wiki/RDFa) attributes.
     *
     * @param {string} rdfaTypeOf - The RDFa type of the table row.
     * @param {string} rdfaResource - The RDFa resource.
     * @param {string} mainColRdfaProp - The RDFa property of the main column.
     * @param {string} mainColTermOrLink - The term name that should be linked or the link of the main column.
     * @param {string} sideCols - The HTML of the side columns.
     * @param {string|null} mainColClass - The CSS class of the main column.
     * @returns {string} The resulting HTML.
     */
    createTableRow(rdfaTypeOf, rdfaResource, mainColRdfaProp, mainColTermOrLink, sideCols, mainColClass = null) {
        return '' +
            '<tr typeof="' + rdfaTypeOf + '" resource="' + rdfaResource + '">' +
            this.createMainCol(mainColRdfaProp, mainColTermOrLink, mainColClass) +
            sideCols +
            '</tr>';
    }

    /**
     * Create a HTML main column for a table row with RDFa (https://en.wikipedia.org/wiki/RDFa) attributes.
     *
     * @param {string} rdfaProp - The RDFa property of the column.
     * @param {string} termOrLink - The term name that should be linked or the link of the column.
     * @param {string|null} className -  The CSS class of the column.
     * @returns {string} The resulting HTML.
     */
    createMainCol(rdfaProp, termOrLink, className = null) {
        return '' +
            '<th' + (className ? ' class="' + className + '"' : '') + ' scope="row">' +
            this.createCodeLink(termOrLink, {'property': rdfaProp}) +
            '</th>';
    }

    /**
     * Create a HTML code element with a link inside it.
     *
     * @param {string} termOrLink - The term name that should be linked or the link.
     * @param {object|null} codeAttr - The HTML attributes of the code element.
     * @param {object|null} linkAttr - The HTML attributes of the link.
     * @param {string|null} rdfaProp - The RDFa property of the link.
     * @returns {string} The resulting HTML.
     */
    createCodeLink(termOrLink, codeAttr = null, linkAttr = null, rdfaProp = null) {
        return '' +
            '<code' + this.createHtmlAttr(codeAttr) + '>' +
            this.createFullLink(termOrLink, linkAttr, rdfaProp) +
            '</code>';
    }

    /**
     * Create a HTML link, optionally with semantic attributes.
     *
     * @param termOrLink - The term name that should be linked or a link.
     * @param linkAttr - The HTML attributes of the link.
     * @param rdfaProp - The RDFa property of the link.
     * @returns {string} The resulting HTML.
     */
    createFullLink(termOrLink, linkAttr, rdfaProp) {
        let term = null;
        try {
            term = this.browser.sdoAdapter.getTerm(termOrLink);
        } catch (e) {
        }
        return '' +
            (rdfaProp ? this.createSemanticLink(rdfaProp, termOrLink) : '') +
            (term ? this.createLink(termOrLink, linkAttr) : termOrLink);
    }

    /**
     * Create a HTML JavaScript link that imitates a standard link with the current browser IRI and the given query
     * parameter.
     *
     * @param {string} queryKey - The query parameter key.
     * @param {string|null} queryVal - The query parameter value.
     * @param {string|null} text - The text of the link.
     * @param {object|null} attr - The HTML attributes of the link.
     * @returns {string} The resulting HTML.
     */
    createJSLink(queryKey, queryVal, text = null, attr = null) {
        const iri = this.createIriWithQueryParam(queryKey, queryVal);
        return '' +
            '<a ' +
            'class="a-js-link" ' +
            'href="' + this.escHtml(iri) + '" ' +
            'onclick="return false;"' +
            this.createHtmlAttr(attr) + '>' +
            (text ? this.escHtml(text) : this.escHtml(queryVal)) +
            '</a>';
    }

    /**
     * Escape HTML characters.
     *
     * @param {string} chars - The characters that should be escaped.
     * @returns {string} The escaped characters.
     */
    escHtml(chars) {
        return chars
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * Create HTML attributes for elements.
     *
     * @param {object|null} attr - The attributes as key-value pairs.
     * @returns {string} The resulting HTML.
     */
    createHtmlAttr(attr) {
        if (attr) {
            return Object.entries(attr).map((a) => {
                return ' ' + this.escHtml(a[0]) + '="' + this.escHtml(a[1]) + '"';
            }).join('');
        } else {
            return '';
        }
    }

    /**
     * Create a HTML link to an external IRI.
     *
     * @param {string} href - The href value of the link.
     * @param {string|null} text - The text of the link.
     * @param {object|null} attr - The HTML attributes as key-value pairs.
     * @returns {string} The resulting HTML.
     */
    createExternalLink(href, text = null, attr = null) {
        const urlObj = new URL(href);
        if (window.location.hostname !== urlObj.hostname) {
            let additionalStyles = ' ' + this.createExternalLinkStyle(href);

            if (!attr) {
                attr = {style: additionalStyles};
            } else if (!attr.hasOwnProperty('style')) {
                attr['style'] = additionalStyles;
            } else {
                attr['style'] = attr['style'] + additionalStyles;
            }
        }

        return '<a href="' + this.escHtml(href) + '" target="_blank"' + this.createHtmlAttr(attr) + '>' +
            (text ? this.prettyPrintIri(text) : this.prettyPrintIri(href)) + '</a>';
    }

    /**
     * Create HTML attribute 'style' for an external link.
     *
     * @param iri - The IRI of the external link.
     * @return {string} The resulting style attribute.
     */
    createExternalLinkStyle(iri) {
        let style = '' +
            'background-position: center right; ' +
            'background-repeat: no-repeat; ' +
            'background-size: 10px 10px; ' +
            'padding-right: 13px; ';
        if (iri.indexOf('https://schema.org') === -1 && iri.indexOf('http://schema.org') === -1) {
            style += 'background-image: url(https://raw.githubusercontent.com/semantifyit/schema-org-vocab-browser/main/images/external-link-icon-blue.png);';
        } else {
            style += 'background-image: url(https://raw.githubusercontent.com/semantifyit/schema-org-vocab-browser/main/images/external-link-icon-red.png);'
        }
        return style;
    }

    /**
     * Removes 'schema:', 'http://schema.org/' & 'https://schema.org/'.
     *
     * @param {string} iri - The IRI that should pretty-printed.
     * @returns {string} The pretty-printed IRI.
     */
    prettyPrintIri(iri) {
        return iri.replace(/^(schema:|https?:\/\/schema.org\/)(.+)/, '$2');
    }

    /**
     * Create a HTML div with the main content for the vocab browser element.
     *
     * @param {string} rdfaTypeOf - The RDFa type of the main content.
     * @param {string} mainContent - The HTML of the main content.
     * @returns {string} The resulting HTML.
     */
    createMainContent(rdfaTypeOf, mainContent) {
        return '' +
            '<div id="mainContent" vocab="http://schema.org/" typeof="' + rdfaTypeOf + '" ' +
            'resource="' + window.location + '">' +
            mainContent +
            '</div>';
    }

    /**
     * Replace spaces with underscores.
     *
     * @param {string} text - The text that should be replaced.
     * @returns {string} The resulting text.
     */
    underscore(text) {
        return text.replace(/ /g, '_');
    }

    /**
     * Retrieve the type structure of a vocabulary term.
     *
     * @param {Term} term - The vocabulary term.
     * @param {string} supertypeFunc - The supertype function that should be called for the vocabulary term.
     * @returns {string[][]} The type structure of the vocabulary term. E.g. https://schema.org/Campground:
     * [
     *   ['schema:Campground', 'schema:LodgingBusiness', 'schema:LocalBusiness', 'schema:Organization', 'schema:Thing'],
     *   ['schema:Campground', 'schema:LodgingBusiness', 'schema:LocalBusiness', 'schema:Place', 'schema:Thing'],
     *   ['schema:Campground', 'schema:CivicStructure', 'schema:Place', 'schema:Thing']
     * ]
     */
    getTypeStructure(term, supertypeFunc = 'getSuperClasses') {
        const supertypes = term[supertypeFunc](false);
        if (supertypes.length === 0) {
            return [[term.getIRI(true)]];
        } else {
            let ret = [];
            supertypes.forEach((s) => {
                const newTerm = this.browser.sdoAdapter.getTerm(s);
                const newSupertypes = this.getTypeStructure(newTerm, supertypeFunc);
                newSupertypes.forEach((n) => {
                    n.push(term.getIRI(true));
                    ret.push(n);
                });
            });
            return ret;
        }
    }

    /**
     * Create a HTML header for the vocab browser element.
     *
     * @param {string[][]} typeStructure - The type structure of the vocabulary term.
     * @param {string} supertypeRelationship - The relationship between the vocabulary term and its supertype.
     * @param {string} breadcrumbStart - The HTML in front of every breadcrumb.
     * @param {string} breadcrumbEnd - The HTML in the end of every breadcrumb.
     * @returns {string} The resulting HTML.
     */
    createHeader(typeStructure, supertypeRelationship, breadcrumbStart = '', breadcrumbEnd = '') {
        const term = this.browser.term;
        return '' +
            '<span style="float: right;">' +
            (this.browser.vocName ?
                '(from Vocabulary: ' + this.createJSLink('term', null, this.browser.vocName) + ')' :
                '(go to ' + this.createJSLink('term', null, 'Vocabulary') + ')') +
            '</span>' +
            '<h1 property="rdfs:label" class="page-title">' + term.getIRI(true) + '</h1>' +
            this.createExternalLinkLegend() +
            this.createTypeStructureBreadcrumbs(typeStructure, supertypeRelationship, breadcrumbStart, breadcrumbEnd) +
            '<div property="rdfs:comment">' + (term.getDescription() || '') + '<br><br></div>';
    }

    /**
     * Create HTML for external link legend.
     *
     * @returns {string} The resulting HTML.
     */
    createExternalLinkLegend() {
        const commonExtLinkStyle = 'margin-right: 3px; ';
        const extLinkStyleBlue = commonExtLinkStyle + this.createExternalLinkStyle('');
        const extLinkStyleRed = commonExtLinkStyle + this.createExternalLinkStyle('https://schema.org') +
            ' margin-left: 6px;';

        return '' +
        '<p style="font-size: 12px; margin-top: 0">' +
        '(<span style="' + extLinkStyleBlue + '"></span>External link' +
        '<span style="' + extLinkStyleRed + '"></span>External link to schema.org )' +
        '</p>';
    }

    /**
     * Create HTML breadcrumbs for the type structure of a vocabulary term.
     *
     * @param {string[][]} typeStructure - The type structure of the vocabulary term.
     * @param {string} supertypeRelationship - The relationship between the vocabulary term and its supertype.
     * @param {string} breadcrumbStart - The HTML in front of every breadcrumb.
     * @param {string} breadcrumbEnd - The HTML in the end of every breadcrumb.
     * @returns {string} - The resulting HTML.
     */
    createTypeStructureBreadcrumbs(typeStructure, supertypeRelationship, breadcrumbStart, breadcrumbEnd) {
        return '' +
            '<h4>' +
            typeStructure.map((s) => {
                return '' +
                    '<span class="breadcrumbs">' +
                    breadcrumbStart +
                    s.map((superType, i) => {
                        let html = '';
                        if ((breadcrumbEnd === '' && (i + 2) === s.length) ||
                            (breadcrumbEnd !== '' && (i + 1) === s.length)) {
                            html += this.createSemanticLink(supertypeRelationship, superType);
                        }
                        html += this.createLink(superType);
                        return html;
                    }).join(' > ') +
                    breadcrumbEnd +
                    '</span>';
            }).join('<br>') +
            '</h4>';
    }

    /**
     * Create a HTML semantic link for a term.
     *
     * @param {string} property - The RDFa property of the link.
     * @param {string} term - The vocabulary term.
     * @returns {string} The resulting HTML.
     */
    createSemanticLink(property, term) {
        return '<link property="' + this.escHtml(property) + '" href="' + this.escHtml(this.createHref(term)) + '">';
    }

    /**
     * Create a HTML href for a vocabulary term.
     *
     * @param {string} term - The vocabulary term.
     * @returns {string} The resulting HTML.
     */
    createHref(term) {
        if (this.isTermOfVocab(term)) {
            return this.createIriWithQueryParam('term', term);
        } else {
            return this.browser.sdoAdapter.getTerm(term).getIRI();
        }
    }

    /**
     * Check if the vocabulary term is part of the current vocabulary.
     *
     * @param {string} term - The vocabulary term.
     * @returns {boolean} 'true' if the term is part of the current vocabulary.
     */
    isTermOfVocab(term) {
        return (this.browser.vocab && (
            this.browser.classes.includes(term) ||
            this.browser.properties.includes(term) ||
            this.browser.enumerations.includes(term) ||
            this.browser.enumerationMembers.includes(term) ||
            this.browser.dataTypes.includes(term)
        ));
    }

    /**
     * Create a HTML link for a term.
     *
     * @param {string} term - The vocabulary term.
     * @param {object|null} attr - The HTML attributes as key-value pairs.
     * @returns {string} The resulting HTML.
     */
    createLink(term, attr = null) {
        if (this.isTermOfVocab(term)) {
            return this.createJSLink('term', term, null, attr);
        } else {
            return this.createExternalLink(this.createHref(term), term, attr);
        }
    }

    /**
     * Create a HTML table row of a schema.org based property.
     *
     * @param {string} property - The schema.org based property
     * @param {boolean} onlyDomainIncludes - Indicates whether 'domainIncludes' is the only semantic link for the
     * property.
     * @returns {string} The resulting HTML.
     */
    createPropertyTableRow(property, onlyDomainIncludes = false) {
        return this.createTableRow('rdf:Property',
            this.createHref(property),
            'rdfs:label',
            this.createLink(property),
            this.createPropertySideCols(property, onlyDomainIncludes),
            'prop-name');
    }

    /**
     * Create HTML side columns of a schema.org based property.
     *
     * @param {string} property - The schema.org based property.
     * @param {boolean} onlyDomainIncludes - Indicates whether 'domainIncludes' is the only semantic link for the
     * property.
     * @returns {string} The resulting HTML.
     */
    createPropertySideCols(property, onlyDomainIncludes) {
        const sdoProperty = this.browser.sdoAdapter.getProperty(property);
        return '' +
            '<td class="prop-etc">' + this.createPropertyRange(sdoProperty, onlyDomainIncludes) + '</td>' +
            '<td class="prop-desc" property="rdfs:comment">' + (sdoProperty.getDescription() || '') + '</td>';
    }

    /**
     * Create HTML links of schema.org based property ranges.
     *
     * @param {Property} sdoProperty - The schema.org based property.
     * @param {boolean} onlyDomainIncludes - Indicates whether 'domainIncludes' is the only semantic link for the
     * property.
     * @returns {string} The resulting HTML.
     */
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

    /**
     * Create a HTML table with class 'definition-table'.
     *
     * @param {string|string[]} ths - The table header cell/s. Must include <th> tags.
     * @param {string|string[]} trs - The table body row/s. Can already include <tr> tags to be more flexible.
     * @param {object|null} tbodyAttr - The HTML attributes of the table body.
     * @returns {string} The resulting HTML.
     */
    createDefinitionTable(ths, trs, tbodyAttr=null) {
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
            '<tbody' + this.createHtmlAttr(tbodyAttr) + '>' +
            (trs[0].startsWith('<tr') ? trs.join('') : trs.map((tr) => {
                return '<tr>' + tr + '</tr>';
            }).join('')) +
            '</tbody>' +
            '</table>';
    }

    /**
     * Create HTML for ranges of a vocabulary term.
     *
     * @param isForEnumMember - Indicates whether the the method is called for an Enumeration Member.
     * @returns {string} The resulting HTML.
     */
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
