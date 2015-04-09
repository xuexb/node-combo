/**
 * 处理文件缓存
 */

var md5 = require('MD5');
var fs = require('fs');
var util = require('./util');


var cache = {};
var cache_path = './cache/';

/**
 * 检查是否命中
 * @param  {string} url 文件url
 * @return {boolean}
 */
cache.check = function(url, response) {
    var url = get_path(url);
    var is_file = fs.existsSync(url);
    var data;

    if (is_file) {
        data = fs.readFileSync(url).toString();
        if (data) {
            data = JSON.parse(data);
        } else {
            console.log('文件失效');
            return false;
        }
        console.log('文件存在 ');
        if (data && new Date().getTime() > data.update_time + 1000 * 60) {
            del(url);
            console.log('文件过期');
            return false;
        }
    } else {
        console.log('文件不存在 ');
        return false;
    }

    //输出文件
    response.writeHead(200, {
        'Content-Type': data.mime
    });
    response.end(data.code);

    return true;
}

/**
 * 写入文件
 * @param  {string} url  链接
 * @param  {string} code 代码
 * @param {string} type 类型，有js,css
 * @param {string} mime 文件类型
 */
cache.write = function(url, code, type, mime) {
    var data = {
        url: url,
        code: code,
        update_time: new Date().getTime(),
        type: type,
        mime: mime
    }

    //创建cache目录
    util.mkdir(cache_path);

    //写入文件
    fs.writeFileSync(get_path(url), JSON.stringify(data));
}


function get_path(url) {
    return cache_path + md5(url) + '.json';
}

/**
 * 删除文件
 */
function del(url) {
    fs.unlinkSync(url);
}


module.exports = cache;