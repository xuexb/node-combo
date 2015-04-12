/**
 * 加载样式文件
 */

var fs = require('fs');
var cssmin = require('cssmin');


function load(data) {
    var code = fs.readFileSync(data.path).toString();

    code = cssmin(code);

    return code;
}

module.exports = load;