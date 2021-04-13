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
        return new Promise(function(resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.setRequestHeader('Accept', 'application/ld+json');
            xhr.onload = function() {
                if (this.status >= 200 && this.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function() {
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
    createHtmlTableRow(rdfaTypeOf, rdfaResource, mainColRdfaProp, mainColTermOrLink, sideCols, mainColClass = null) {
        const htmlMainCol = this.createHtmlMainCol(mainColRdfaProp, mainColTermOrLink, mainColClass);
        return `<tr typeof="${rdfaTypeOf}" resource="${rdfaResource}">
            ${htmlMainCol} ${sideCols}</tr>`;
    }

    /**
     * Create a HTML main column for a table row with RDFa (https://en.wikipedia.org/wiki/RDFa) attributes.
     *
     * @param {string} rdfaProp - The RDFa property of the column.
     * @param {string} termOrLink - The term name that should be linked or the link of the column.
     * @param {string|null} className -  The CSS class of the column.
     * @returns {string} The resulting HTML.
     */
    createHtmlMainCol(rdfaProp, termOrLink, className = null) {
        const htmlCodeLink = this.createHtmlCodeWithLink(termOrLink, {'property': rdfaProp});
        const htmlClass = className ? ' class="' + className + '"' : '';
        return `<th ${htmlClass} scope="row">${htmlCodeLink}</th>`;
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
    createHtmlCodeWithLink(termOrLink, codeAttr = null, linkAttr = null, rdfaProp = null) {
        const htmlAttr = this.createHtmlAttr(codeAttr);
        const htmlFullLink = this.createHtmlFullLink(termOrLink, linkAttr, rdfaProp);
        return `<code ${htmlAttr}>${htmlFullLink}</code>`;
    }

    /**
     * Create a HTML link, optionally with semantic attributes.
     *
     * @param termOrLink - The term name that should be linked or a link.
     * @param linkAttr - The HTML attributes of the link.
     * @param rdfaProp - The RDFa property of the link.
     * @returns {string} The resulting HTML.
     */
    createHtmlFullLink(termOrLink, linkAttr, rdfaProp) {
        let term;
        try {
            term = this.browser.sdoAdapter.getTerm(termOrLink);
        } catch (e) {
            term = null;
        }
        return (rdfaProp ? this.createHtmlSemanticLink(rdfaProp, termOrLink) : '') +
            (term ? this.createLink(termOrLink, linkAttr) : termOrLink);
    }

    createInternalLink(navigationChanges, text = null, attr = null) {
        text = this.escHtml(text);
        const hrefLink = this.browser.locationControl ? this.createInternalHref(navigationChanges) : 'javascript:void(0)';
        const htmlOnClick = this.browser.locationControl ? 'onclick="return false;"' : '';
        const htmlAttr = this.createHtmlAttr(attr);
        const htmlState = 'data-state-changes="' + encodeURIComponent(JSON.stringify(navigationChanges)) + '"';
        return `<a class="a-js-link" href="${hrefLink}" ${htmlAttr} ${htmlOnClick} ${htmlState}>
        ${text}</a>`;
    }

    createInternalHref(navigationChanges, htmlEscaped = true) {
        let navigationState = this.createNavigationState(navigationChanges);
        let domain = window.location.protocol + '//' + (window.location.host ? window.location.host : '');
        let url;
        let urlParameterArray = [];
        if (navigationState.listId) {
            // is list
            url = domain + '/list/' + navigationState.listId;
            if (navigationState.vocId) {
                urlParameterArray.push(['voc', navigationState.vocId]);
            }
        } else {
            // must be ds
            url = domain + '/voc/' + navigationState.vocId;
        }
        if (navigationState.termURI) {
            urlParameterArray.push(['term', navigationState.termURI]);
        }
        if (navigationState.format) {
            urlParameterArray.push(['format', navigationState.format]);
        }
        for (let i = 0; i < urlParameterArray.length; i++) {
            let prefix = '&';
            if (i === 0) {
                prefix = '?';
            }
            url += prefix + encodeURIComponent(urlParameterArray[i][0]) + '=' + encodeURIComponent(urlParameterArray[i][1]);
        }
        return htmlEscaped ? this.escHtml(url) : url;
    }

    createNavigationState(navigationChanges) {
        let newState = {};
        const navigationParameters = ["listId", "vocId", "termURI", "format"];
        for (const p of navigationParameters) {
            if (navigationChanges[p] !== undefined) {
                newState[p] = navigationChanges[p];
            } else {
                newState[p] = this.browser[p];
            }
        }
        return newState;
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
        if (!attr) {
            return '';
        }
        return Object.entries(attr).map((a) => {
            return ' ' + this.escHtml(a[0]) + '="' + this.escHtml(a[1]) + '"';
        }).join('');
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
                // eslint-disable-next-line no-prototype-builtins
            } else if (!attr.hasOwnProperty('style')) {
                attr['style'] = additionalStyles;
            } else {
                attr['style'] = attr['style'] + additionalStyles;
            }
            attr['target'] = '_blank';
        }

        return '<a href="' + this.escHtml(href) + '"' + this.createHtmlAttr(attr) + '>' +
            (text ? this.prettyPrintIri(text) : this.prettyPrintIri(href)) + '</a>';
    }

    /**
     * Create HTML attribute 'style' for an external link.
     *
     * @param iri - The IRI of the external link.
     * @return {string} The resulting style attribute.
     */
    createExternalLinkStyle(iri) {
        let style = `background-position: center right; 
            background-repeat: no-repeat; 
            background-size: 10px 10px; 
            padding-right: 13px; `;
        if (iri.indexOf('https://schema.org') === -1 && iri.indexOf('http://schema.org') === -1) {
            style += 'background-image: url(https://raw.githubusercontent.com/semantifyit/schema-org-vocab-browser/main/images/external-link-icon-blue.png);';
        } else {
            style += 'background-image: url(https://raw.githubusercontent.com/semantifyit/schema-org-vocab-browser/main/images/external-link-icon-red.png);';
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
    createHtmlMainContent(rdfaTypeOf, mainContent) {
        const resource = window.location;
        return `<div id="mainContent" vocab="http://schema.org/" typeof="${rdfaTypeOf}" resource="${resource}">${mainContent}</div>`;
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
    createHtmlHeader(typeStructure, supertypeRelationship, breadcrumbStart = '', breadcrumbEnd = '') {
        const term = this.browser.term;
        const termIri = term.getIRI(true);
        const termDescription = this.repairLinksInHTMLCode(term.getDescription()) || '';
        const htmlVocabLink = '(from Vocabulary: ' + this.createInternalLink({termURI: null}, this.browser.getVocabName() || "Vocabulary") + ')';
        const htmlExternalLinkLegend = this.createHtmlExternalLinkLegend();
        const htmlBreadcrumbs = this.createHtmlTypeStructureBreadcrumbs(typeStructure, supertypeRelationship, breadcrumbStart, breadcrumbEnd);
        return `<span style="float: right;">${htmlVocabLink}</span>
            <h1 property="rdfs:label" class="page-title">${termIri}</h1>
            ${htmlExternalLinkLegend} ${htmlBreadcrumbs}
            <div property="rdfs:comment">${termDescription}<br><br></div>`;
    }

    /**
     * Create HTML for external link legend.
     *
     * @returns {string} The resulting HTML.
     */
    createHtmlExternalLinkLegend() {
        const commonExtLinkStyle = 'margin-right: 3px; ';
        const extLinkStyleBlue = commonExtLinkStyle + this.createExternalLinkStyle('');
        const extLinkStyleRed = commonExtLinkStyle + this.createExternalLinkStyle('https://schema.org') +
            ' margin-left: 6px;';
        return `<p style="font-size: 12px; margin-top: 0">
            (<span style="${extLinkStyleBlue}"></span>External link
            <span style="${extLinkStyleRed}"></span>External link to schema.org)</p>`;
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
    createHtmlTypeStructureBreadcrumbs(typeStructure, supertypeRelationship, breadcrumbStart, breadcrumbEnd) {
        return '<h4>' +
            typeStructure.map((s) => {
                return '' +
                    '<span class="breadcrumbs">' +
                    breadcrumbStart +
                    s.map((superType, i) => {
                        let html = '';
                        if ((breadcrumbEnd === '' && (i + 2) === s.length) ||
                            (breadcrumbEnd !== '' && (i + 1) === s.length)) {
                            html += this.createHtmlSemanticLink(supertypeRelationship, superType);
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
    createHtmlSemanticLink(property, term) {
        const htmlProperty = this.escHtml(property);
        const htmlHref = this.escHtml(this.createHref(term));
        return `<link property="${htmlProperty}" href="${htmlHref}">`;
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
            return this.createInternalLink({termURI: term}, term, attr);
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
        return this.createHtmlTableRow('rdf:Property',
            this.createHref(property),
            'rdfs:label',
            this.createLink(property),
            this.createHtmlPropertySideCols(property, onlyDomainIncludes),
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
    createHtmlPropertySideCols(property, onlyDomainIncludes) {
        const sdoProperty = this.browser.sdoAdapter.getProperty(property);
        const htmlPropertyRange = this.createHtmlPropertyRange(sdoProperty, onlyDomainIncludes);
        const htmlPropertyDescription = this.repairLinksInHTMLCode(sdoProperty.getDescription()) || '';
        return `<td class="prop-etc">${htmlPropertyRange}</td>
            <td class="prop-desc" property="rdfs:comment">${htmlPropertyDescription}</td>`;
    }

    /**
     * Create HTML links of schema.org based property ranges.
     *
     * @param {Property} sdoProperty - The schema.org based property.
     * @param {boolean} onlyDomainIncludes - Indicates whether 'domainIncludes' is the only semantic link for the
     * property.
     * @returns {string} The resulting HTML.
     */
    createHtmlPropertyRange(sdoProperty, onlyDomainIncludes) {
        let expectedType = '';
        const separator = '&nbsp; or <br>';
        if (!onlyDomainIncludes) {
            expectedType = sdoProperty.getRanges(false).map((p) => {
                return this.createHtmlSemanticLink('rangeIncludes', p) + this.createLink(p);
            }).join(separator);
        }
        const domainIncludes = sdoProperty.getDomains(false).map((d) => {
            return this.createHtmlSemanticLink('domainIncludes', d) +
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
    createHtmlDefinitionTable(ths, trs, tbodyAttr = null) {
        if (!Array.isArray(ths)) {
            ths = [ths];
        }
        if (!Array.isArray(trs)) {
            trs = [trs];
        }
        const htmlThs = ths.map((th) => {
            return '<th>' + th + '</th>';
        }).join('');
        const htmlTrs = trs[0].startsWith('<tr') ? trs.join('') : trs.map((tr) => {
            return '<tr>' + tr + '</tr>';
        }).join('');
        const htmlAttr = this.createHtmlAttr(tbodyAttr);
        return `<table class="definition-table table">
            <thead><tr>${htmlThs}</tr></thead>
            <tbody ${htmlAttr}>${htmlTrs}</tbody></table>`;
    }

    /**
     * Create HTML for ranges of a vocabulary term.
     *
     * @param isForEnumMember - Indicates whether the the method is called for an Enumeration Member.
     * @returns {string} The resulting HTML.
     */
    createHtmlRangesOf(isForEnumMember = false) {
        const rangeOf = this.browser.term.isRangeOf(false);
        if (rangeOf.length === 0) {
            return '';
        }
        const trs = rangeOf.map((r) => {
            return this.createPropertyTableRow(r, true);
        });
        const htmlLink = this.createLink(this.browser.term.getIRI(true));
        const textIsForEnumMember = isForEnumMember ? 'and its enumeration members or subtypes ' : '';
        const htmlDefinitionTable = this.createHtmlDefinitionTable(['Property', 'On Types', 'Description'], trs);
        return `<div id="incoming">Instances of ${htmlLink} ${textIsForEnumMember}may appear as a value for the following properties
            </div><br>${htmlDefinitionTable}`;
    }

    getFileHost() {
        if (this.browser.selfFileHost) {
            return window.location.origin;
        } else {
            return "https://semantify.it";
        }
    }

    repairLinksInHTMLCode(htmlCode) {
        let result = htmlCode;
        // relative links of schema.org
        result = result.replace(/<a(.*?)href="(.*?)"/g, (match, group1, group2) => {
            if (group2.startsWith('/')) {
                group2 = 'http://schema.org' + group2;
            }
            const style = this.createExternalLinkStyle(group2);
            return '<a' + group1 + 'href="' + group2 + '" style="' + style + '" target="_blank"';
        });
        // markdown for relative links of schema.org
        result = result.replace(/\[\[(.*?)]]/g, (match, group1) => {
            const URL = 'http://schema.org/' + group1;
            const style = this.createExternalLinkStyle(URL);
            return '<a href="' + URL + '" style="' + style + '" target="_blank">' + group1 + '</a>';
        });
        // markdown for outgoing link
        result = result.replace(/\[(.*?)]\((.*?)\)/g, (match, group1, group2) => {
            if (group2.startsWith('/')) {
                group2 = 'http://schema.org' + group2;
            } else if (!group2.startsWith("http")){
                // assume this is a local schema.org link
                group2 = 'http://schema.org/' + group2;
            }
            const style = this.createExternalLinkStyle(group2);
            return '<a href="' + group2 + '" style="' + style + '" target="_blank">' + group1 + '</a>';
        });
        // new line
        result = result.replace(/\\n/g,(match) => {
            return "</br>";
        });
        // bold
        result = result.replace(/__(.*?)__/g, (match, group1 ) => {
            return "<b>"+group1+"</b>";
        });
        // code
        result = result.replace(/```(.*?)```/g, (match, group1) => {
            return "<code>"+group1+"</code>";
        });
        return result;
    }
}

module.exports = Util;