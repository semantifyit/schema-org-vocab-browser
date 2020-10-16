/** This class is responsible to render a schema.org based Property in the HTML element of the browser. */
class PropertyRenderer {
    /**
     * Create a PropertyRenderer object.
     *
     * @param {SDOVocabBrowser} browser - the underlying vocab browser to enable access to its data members.
     */
    constructor(browser) {
        this.browser = browser;
        this.util = this.browser.util;
    }

    /**
     * Render the Property.
     */
    render() {
        const startBreadcrumbs = this.createStartBreadcrumbs();
        const typeStructure = this.util.getTypeStructure(this.browser.term, 'getSuperProperties');
        const mainContent = this.util.createHeader(typeStructure, 'rdfs:subPropertyOf', startBreadcrumbs) +
            this.createRanges() +
            this.createDomainIncludes() +
            this.createSuperproperties() +
            this.createSubproperties();
        this.browser.elem.innerHTML = this.util.createMainContent('rdf:Property', mainContent);
    }

    /**
     * Create HTML for the initial breadcrumbs of the Property.
     *
     * @returns {string} The resulting HTML.
     */
    createStartBreadcrumbs() {
        return '' +
            this.util.createLink('schema:Thing') +
            " > " +
            this.util.createLink('schema:Property', {'title': 'Defined in section: meta.schema.org'}) +
            " > ";
    }

    /**
     * Create HTML for the ranges of the Property.
     *
     * @returns {string} The resulting HTML.
     */
    createRanges() {
        const ranges = this.browser.term.getRanges(false).map((r) => {
            const title = {
                'title': 'The \'' + this.browser.term.getIRI(true) +
                    '\' property has values that include instances of the' + ' \'' + r + '\' type.'
            };
            return this.util.createCodeLink(r, null, title, 'rangeIncludes');
        }).join('<br>');

        return this.util.createDefinitionTable('Values expected to be one of these types', '<td>' + ranges + '</td>');
    }

    /**
     * Create HTML for the domains of the Property.
     *
     * @returns {string} The resulting HTML.
     */
    createDomainIncludes() {
        const domains = this.browser.term.getDomains(false).map((d) => {
            const title = {
                'title': 'The \'' + this.browser.term.getIRI(true) + '\' property ' + 'is used on the \'' + d +
                    '\' ' + 'type'
            };
            return this.util.createCodeLink(d, null, title, 'domainIncludes');
        }).join('<br>');

        return this.util.createDefinitionTable('Used on these types', '<td>' + domains + '</td>');
    }

    /**
     * Create HTML for the superproperties of the Property.
     *
     * @returns {string} The resulting HTML.
     */
    createSuperproperties() {
        const superProperties = this.browser.term.getSuperProperties(false);
        return this.createRelatedProperties(superProperties, 'Super-properties');
    }

    /**
     * Create HTML for related properties (superproperties or subproperties) of the Property.
     *
     * @param {string[]} relatedProperties - The related properties of the Property.
     * @param {string} th - The table header for the related properties.
     * @returns {string} The resulting HTML.
     */
    createRelatedProperties(relatedProperties, th) {
        if (relatedProperties.length !== 0) {
            const relatedTermsHTML = relatedProperties.map((s) => {
                const title = {
                    'title': s + ': \'\'' + (this.browser.sdoAdapter.getProperty(s).getDescription() || '') + '\'\''
                };
                return this.util.createCodeLink(s, null, title);
            }).join('<br>');

            return this.util.createDefinitionTable(th, '<td>' + relatedTermsHTML + '</td>');
        } else {
            return '';
        }
    }

    /**
     * Create HTML for the subproperties of the Property.
     *
     * @returns {string} The resulting HTML.
     */
    createSubproperties() {
        const subProperties = this.browser.term.getSubProperties(false);
        return this.createRelatedProperties(subProperties, 'Sub-properties');
    }
}

module.exports = PropertyRenderer;
