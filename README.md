# Schema.org Vocabulary Browser

Vocabulary Browser for schema.org based vocabularies.

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

Use the function `SDOVocabBrowser()` to render a Vocabulary Browser in a target HTML element.

You can use the Vocabulary directly as object or pass a URL to its location.

``` html
<div id="vocab-container"></div>
<script>
    (async function() {
        const vocabURL = 'https://raw.githubusercontent.com/semantifyit/schema-org-adapter/master/tests/data/exampleExternalVocabulary.json';
        const sdoVocabBrowser = new SDOVocabBrowser(document.getElementById('vocab-container'), vocabURL);
        await sdoVocabBrowser.render();
    })();
</script>
```

It is also possible to render a List of Vocabularies. In order to do that, you need to pass the `type` argument to the function `SDOVocabBrowser()`. The `type` argument is `'VOCAB'` by default, but must be `'LIST'` to render a List of Vocabularies.

``` html
<div id="vocab-container"></div>
<script>
    (async function() {
        const listURL = 'https://semantify.it/list/I7ikMwcXo';
        const sdoVocabBrowser = new SDOVocabBrowser(document.getElementById('vocab-container'), listURL, 'LIST');
        await sdoVocabBrowser.render();
    })();
</script>
```


If you want to use the same style as [schema.org](https://schema.org/) just import their CSS file:

``` html
<link rel="stylesheet" type="text/css" href="https://schema.org/docs/schemaorg.css">
```

## Screenshot

![Example](images/example.png)
