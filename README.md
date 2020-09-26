# Schema.org Vocabulary Browser

Vocabulary Browser for schema.org based vocabularies.

## Installation

Clone the repository, install npm packages and build it with [browserify](http://browserify.org/):

``` bash
git clone git@github.com:semantifyit/schema-org-vocab-browser.git
cd schema-org-vocab-browser
npm install
browserify src/SDOVocabBrowser.js -s SDOVocabBrowser > bundle.js
```

## Usage

Require the bundled file in your website, import your vocabulary and generate the corresponding HTML:

``` xml
<div id="vocab"></div>
<script src="bundle.js"></script>
<script>
    (async function() {
        const vocabURL = 'https://raw.githubusercontent.com/semantifyit/schema-org-adapter/master/tests/data/exampleExternalVocabulary.json';
        const sdoVocabBrowser = new SDOVocabBrowser(document.getElementById('vocab'), vocabURL);
        await sdoVocabBrowser.generateHTML();
    })();
</script>
```

If you want to use the same style as [schema.org](https://schema.org/) just import their CSS file:


``` javasript
<link rel="stylesheet" type="text/css" href="https://schema.org/docs/schemaorg.css">
```

## Screenshot

![Example](images/example.png)
