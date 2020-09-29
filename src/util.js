function createAttrForJSLink(className, queryKey, queryVal, attr = null) {
    const iri = createIRIwithQueryParam(queryKey, queryVal);
    return 'class="' + escHTML(className) + '" href="' + escHTML(iri) + '" onclick="return false;"' + createHTMLAttr(attr);
}

function createExternalLink(href, text = null, attr = null) {
    return '<a href="' + escHTML(href) + '" target="_blank"' + createHTMLAttr(attr) + '>' +
        (text ? prettyPrintURI(text) : prettyPrintURI(href)) + '</a>';
}

/**
 *
 * @param {object|null} attr
 * @returns {string}
 */
function createHTMLAttr(attr) {
    if (attr) {
        return Object.entries(attr).map((a) => {
            return ' ' + escHTML(a[0]) + '="' + escHTML(a[1]) + '"';
        }).join('');
    } else {
        return '';
    }
}

function createIRIwithQueryParam(key, val) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(key, val);
    return window.location.origin + window.location.pathname + '?' + searchParams.toString();
}

function createJSLink(className, queryKey, queryVal, text = null, attr = null) {
    return '<a ' + createAttrForJSLink(className, queryKey, queryVal, attr) + '>' + (text ? escHTML(text) :
        escHTML(queryVal)) + '</a>';
}

function escHTML(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function get(url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
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

function isValidUrl(string) {
    try {
        new URL(string);
    } catch (_) {
        return false;
    }

    return true;
}

function prettyPrintURI(uri) {
    const schema = 'schema:';
    if (uri.startsWith(schema)) {
        return uri.substring(schema.length)
    }
    return escHTML(uri);
}

function underscore(text) {
    return text.replace(/ /g, '_');
}

module.exports = {
    createAttrForJSLink: createAttrForJSLink,
    createExternalLink: createExternalLink,
    createHTMLAttr: createHTMLAttr,
    createIRIwithQueryParam: createIRIwithQueryParam,
    createJSLink: createJSLink,
    escHTML: escHTML,
    get: get,
    isValidUrl: isValidUrl,
    underscore: underscore
};