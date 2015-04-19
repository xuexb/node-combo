/**
 * 处理url
 * @把地址栏的url解析，并生成绝对路径，cmdURI，扩展名的路径数组
 */

var path = require('path');
var util = require('./util');


/**
 * 处理url
 * @param  {string} str    请求的全路径
 * @param  {object} config 配置文件
 * @return {object}
 */
function url(str, config) {
    var data = {},
        index, Prefix;

    //为了查找时间缀
    str = str.replace('??', '@@');
    index = str.lastIndexOf('?');
    if (index > -1) {
        data.type = util.queryUrl('type', str.slice(index));
        str = str.substr(0, index);
    }

    //默认类型
    if (data.type !== 'js' && data.type !== 'css') {
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

    //路径前缀
    data.prefix = Prefix;

    //文件url数组
    data.files = [];
    str.substr(index + 2).split(',').forEach(function(val) {
        var ext, uri;

        if (!val) {
            return;
        }

        //取扩展名
        ext = path.extname(val);

        //如果没有后缀则使用默认
        if (!ext) {
            ext = data.type;
            val += '.' + ext;
        } else {
            ext = ext.slice(1);
            //如果非法
            if (['js', 'css', 'tpl'].indexOf(ext) === -1) {
                return;
            }
        }

        //生成cmd使用uri
        uri = val[0] === '/' ? val.substr(1) : val;
        //只对js替换
        if(ext === 'js'){
            uri = uri.replace('.js', '');
        }

        //拼数据
        data.files[data.files.length] = {
            path: path.resolve(config.base, val[0] === '/' ? val.substr(1) : Prefix + val), //全路径
            uri: uri,
            ext: ext, //扩展名
            parse: data.type === ext && ext === 'js' ? 'js' : data.type === 'js' && ext === 'css' ? 'css_js' : data.type === 'js' && ext === 'tpl' ? 'tpl_js' : data.type === ext && ext === 'css' ? 'css' : 'js',
        }
    });

    return data;
}


module.exports = url;