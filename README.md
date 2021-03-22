# Schema.org Vocabulary Browser

Vocabulary Browser for schema.org-based vocabularies.

## Installation

### Installation via CDN

Add the bundled CDN file to your website:

``` html
<script src="https://cdn.jsdelivr.net/npm/schema-org-vocab-browser@1.0.4/dist/schema-org-vocab-browser.min.js">
```

### Installation via NPM

Install the npm package:

``` bash
npm install schema-org-vocab-browser
```

Add the bundled file to your website:

``` html
<script src="node_modules/schema-org-vocab-browser/dist/schema-org-vocab-browser.min.js">
```

## Usage

Use the function `SDOVocabBrowser(parametersObject)` to initialize a new Vocabulary Browser instance with your wished parameters, then use the function .render() of your created instance to build the Vocabulary browser UI in the given target HTML element.

The parametersObject given for the initialization of the Vocabulary Browser has following attributes:

* `targetElement` (mandatory) - the html element in which the Vocabulary Browser should be rendered.
* `locationControl` (optional, default: true) - boolean flag, if the URL address should be manipulated for navigation or not

If locationControl is true, then the following parameters will be read from the current URL. If it is false, the following parameters must/can be given in the parametersObject. At least the `listId` or the `vocId` MUST be given.

* `listId` - the id of the Vocabulary List hosted at semantify.it which should be rendered (e.g. if the @id of the document is `https://semantify.it/list/I7ikMwcXo`, then the listId to pass is `I7ikMwcXo`)
* `vocId` - the id of the Vocabulary hosted at semantify.it which should be rendered (e.g. if the @id of the document is `https://semantify.it/voc/KEl6e6F0U`, then the vocId to pass is `KEl6e6F0U`). It is possible to pick a specific Vocabulary of a given List if both listId and vocId are given.
* `termURI` - the term within the Vocabulary that should be shown (e.g. "ex:Animal")
* `format` - the format in which the Vocabulary should be rendered (options are `null` for the normal html view, or `jsonld` for the raw json-ld representation)

``` html
<div id="vocab-container"></div>
<script>
    (async function() {
       const vocabBrowser = new SDOVocabBrowser({
            targetElement: document.getElementById("vocab-container"),
            locationControl: false,
            listId: "I7ikMwcXo",
            vocId: "KEl6e6F0U",
            termURI: "ex:Animal"
        });
        await vocabBrowser.render();
    })();
</script>
```

If you want to use the same style as [schema.org](https://schema.org/) just import their CSS file:

``` html
<link rel="stylesheet" type="text/css" href="https://schema.org/docs/schemaorg.css">
```

## Screenshot

![Example](images/example.png)
