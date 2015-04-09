/**
 * 处理别名
 */

var config = require('../package.json');

function alias(url) {
    var alias = url.slice(url.indexOf('??') + 2);
    if (config.alias[alias]) {
        console.log('alias存在 ', alias);
        console.log(config.alias[alias])
        url = config.alias[alias];
    }

    return url;
}


module.exports = alias;