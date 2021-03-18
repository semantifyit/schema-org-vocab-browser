const express = require('express');
const path = require("path");
const app = express();

// disable cache
app.set('etag', false);
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

app.get('/schema-org-vocab-browser.js', function(req, res) {
    return res.sendFile(path.join(__dirname, '../dist/', 'schema-org-vocab-browser.js'));
});

// This route CAN be taken for locationControl: false
app.get('/', function(req, res) {
    return res.sendFile(path.join(__dirname, './', 'test-vocab.html'));
});

// This route MUST be taken for locationControl: true when displaying a single ds, e.g. http://localhost:8080/voc/KEl6e6F0U
app.get('/voc/*', function(req, res) {
    return res.sendFile(path.join(__dirname, './', 'test-vocab.html'));
});

// This route MUST be taken for locationControl: true when displaying a ds list, e.g. http://localhost:8080/list/I7ikMwcXo
app.get('/list/*', function(req, res) {
    return res.sendFile(path.join(__dirname, './', 'test-vocab.html'));
});

app.listen(8080);