/**
 * 处理别名
 */

function alias(url, config) {
    var alias = url.slice(url.indexOf('??') + 2);
    if (config.alias[alias]) {
        url = config.alias[alias];
    }
    return url;
}

module.exports = alias;