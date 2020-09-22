function createAttrForJSLink(className, queryKey, queryVal, attr=null) {
    const iri = createIRIwithQueryParam(queryKey, queryVal);
    return 'class="' + className + '" href="' + iri + '" onclick="return false;"' +  createHTMLAttr(attr);
}

function createExternalLink(href, text=null, attr=null) {
    return '<a href="' + href + '" target="_blank"' + createHTMLAttr(attr) + '>' + (text ? text : href) + '</a>';
}

/**
 *
 * @param {object|null} attr
 * @returns {string}
 */
function createHTMLAttr(attr) {
    if (attr) {
        return Object.entries(attr).map((a) => {
            return ' ' + a[0] + '="' + a[1] + '"';
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

function createJSLink(className, queryKey, queryVal, text=null, attr=null) {
    return '<a ' + createAttrForJSLink(className, queryKey, queryVal, attr) + '>' + (text ? text : queryVal) + '</a>';
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



module.exports = {
    createAttrForJSLink: createAttrForJSLink,
    createExternalLink: createExternalLink,
    createHTMLAttr: createHTMLAttr,
    createIRIwithQueryParam: createIRIwithQueryParam,
    createJSLink: createJSLink,
    get: get,
    isValidUrl: isValidUrl
};