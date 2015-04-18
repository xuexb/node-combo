/**
 * 加载样式文件转换为cmd
 */

var css = require('./css');

function load(data) {
    var code = css(data);

    code = code.replace(/\\/g, '\\\\').replace(/\'/g, '\\\'');

    code = 'define(\''+ data.uri +'\',[], function(){seajs.importStyle(\''+ code +'\');});';

    return code;
}

module.exports = load;