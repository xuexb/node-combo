/**
 * 加载js文件
 */

var Fs = require('fs');


function load(path){
    var data = Fs.readFileSync(path);

    return data;
}

module.exports = load;