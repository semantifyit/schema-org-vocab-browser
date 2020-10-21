# Schema.org Vocabulary Browser

Vocabulary Browser for schema.org based vocabularies.

## Installation

### Installation via CDN

Add the bundled CDN file to your website:

``` html
<script src="https://cdn.jsdelivr.net/npm/schema-org-vocab-browser@1.0.2/dist/schema-org-vocab-browser.min.js">
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

Import your vocabulary and render the corresponding HTML:

``` html
<div id="vocab"></div>
<script>
    (async function() {
        const vocabURL = 'https://raw.githubusercontent.com/semantifyit/schema-org-adapter/master/tests/data/exampleExternalVocabulary.json';
        const sdoVocabBrowser = new SDOVocabBrowser(document.getElementById('vocab'), vocabURL);
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
