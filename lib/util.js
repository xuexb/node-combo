var util = {};

/**
 * 解析URL
 */
util.queryUrl = function(name, url) {
    var results,
        params, qrs2, i, len;

    if (typeof(url) !== 'string') {
        return '';
    }

    if(url[0] === '?'){
        url = url.substr(1);
    }

    if (name) {
        results = url.match(new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i'));
        results = results === null ? '' : decodeURIComponent(results[2]);
    } else {
        results = {};
        if (url) {
            params = url.split('&');
            i = 0;
            len = params.length;
            for (i = 0; i < len; i++) {
                qrs2 = params[i].split('=');
                results[qrs2[0]] = (qrs2[1] === void 0 ? '' : decodeURIComponent(qrs2[1]));
            }
        }
    }
    return results;
}


module.exports = util;