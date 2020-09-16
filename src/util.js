function addQueryParam(key, val) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set(key, val);
    return window.location.origin + window.location.pathname + '?' + searchParams.toString();
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
    addQueryParam: addQueryParam,
    get: get,
    isValidUrl: isValidUrl
};