/**
 * 加载样式文件
 */

var Fs = require('fs');
var Config = require('../../package.json');
var cssmin = require('cssmin');


function load(path) {
    var data = Fs.readFileSync(path).toString();

    //如果需要压缩
    if (Config.css_min) {
        data = cssmin(data);
    }

    data = '\n/** \n'+ path + '\n*/\n'  + data;
    return data;
}

module.exports = load;