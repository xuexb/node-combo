/**
 * 处理url
 * @把地址栏的url解析，并生成绝对路径，cmdURI，扩展名的路径数组
 */

var path = require('path');
var util = require('./util');

function url(str, config) {
    var data = {},
        index, Prefix, dot_index;

    //为了查找时间缀
    str = str.replace('??', '@@');
    dot_index = str.lastIndexOf('?');
    if (dot_index > -1) {
        data.type = util.queryUrl('type', str.slice(dot_index));
        if (data.type !== 'js' && data.type !== 'css') {
            data.type = 'js';
        }
        str = str.substr(0, dot_index);
    } else {
        data.type = 'js';
    }



    //计算位置
    index = str.indexOf('@@');

    //得到路径前缀
    Prefix = str.substr(0, index) || '';

    //如果不是以/结尾,但这里要判断如果为空
    if (Prefix && Prefix.slice(-1) !== '/') {
        Prefix += '/';
    }

    //文件url数组
    data.files = [];
    str.substr(index + 2).split(',').forEach(function(val) {
        var ext = path.extname(val); //取扩展名

        //如果没有则追加文件
        if (!ext) {
            ext = data.type;
            val += '.' + ext;
        } else {
            ext = ext.slice(1);
        }

        //如果不是css,js则不算
        //@todo tpl->js,css->js
        if (ext !== 'js' && ext !== 'css') {
            return;
        }

        data.files[data.files.length] = {
            prefix: Prefix,
            path: path.resolve(config.base, val[0] === '/' ? val.substr(1) : Prefix + val), //全路径
            uri: (val[0] === '/' ? val.substr(1) : val).replace('.' + ext, ''), //没有后缀的uri,用来cmd URI
            ext: ext, //扩展名
        }
    });

    return data;
}


module.exports = url;