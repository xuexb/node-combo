/**
 * 处理别名
 */

function alias(url, config) {
    var alias = url.slice(url.indexOf('??') + 2),
        ver;


    //处理别名+版本
    alias = alias.split('?');
    ver = alias[1];
    alias = alias[0];

    if (config.alias[alias]) {
        url = config.alias[alias];
        if(ver){
            url += '?' + ver;
        }

        if(url.indexOf('??') === -1){
            url = '??'+ url;
        }
    }

    return url;
}

module.exports = alias;