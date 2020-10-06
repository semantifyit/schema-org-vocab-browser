class PropertyRenderer {
    constructor(browser) {
        this.browser = browser;
        this.util = this.browser.util;
    }

    render() {
        const startBreadcrumbs = this.createStartBreadcrumbs();
        const superProperties = this.util.getTypeStructures(this.browser.term, 'getSuperProperties');
        const mainContent = this.util.createHeader(superProperties, 'rdfs:subPropertyOf', startBreadcrumbs) +
            this.createRanges() +
            this.createDomainIncludes() +
            this.createSuperProperties() +
            this.createSubProperties();
        this.browser.elem.innerHTML = this.util.createMainContent('rdf:Property', mainContent);
    }

    createStartBreadcrumbs() {
        return '' +
            this.util.createLink('schema:Thing') +
            " > " +
            this.util.createLink('schema:Property', {'title': 'Defined in section: meta.schema.org'}) +
            " > ";
    }

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

    createSuperProperties() {
        const superProperties = this.browser.term.getSuperProperties(false);
        return this.createRelationship(superProperties, 'Super-properties');
    }

    createRelationship(relatedTerms, tableHeader) {
        if (relatedTerms.length !== 0) {
            const relatedTermsHTML = relatedTerms.map((s) => {
                const title = {
                    'title': s + ': \'\'' + (this.browser.sdoAdapter.getProperty(s).getDescription() || '') + '\'\''
                };
                return this.util.createCodeLink(s, null, title);
            }).join('<br>');

            return this.util.createDefinitionTable(tableHeader, '<td>' + relatedTermsHTML + '</td>');
        } else {
            return '';
        }
    }

    createSubProperties() {
        const subProperties = this.browser.term.getSubProperties(false);
        return this.createRelationship(subProperties, 'Sub-properties');
    }
}

module.exports = PropertyRenderer;
