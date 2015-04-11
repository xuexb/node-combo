/**
 * 处理文件缓存
 */

var md5 = require('MD5');
var fs = require('fs');
var path = require('path');
var util = require('./util');


var cache = {};

/**
 * 检查是否命中
 * @param  {string} url 文件url
 * @return {boolean}
 */
cache.check = function(url, config, response) {
    var url = path.resolve(config.cache_path, md5(url) + '.json');
    var is_file = fs.existsSync(url);
    var data;

    if (is_file) {
        data = fs.readFileSync(url).toString();
        if (data) {
            data = JSON.parse(data);
        } else {
            return false;
        }
        if (data && new Date().getTime() > data.update_time + config.expiration_time) {
            fs.unlinkSync(url);
            return false;
        }
    } else {
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
cache.write = function(url, code, type, mime, config) {
    var data = {
        url: url,
        code: code,
        update_time: new Date().getTime(),
        type: type,
        mime: mime
    }

    //创建cache目录
    util.mkdir(config.cache_path);

    //写入文件
    fs.writeFileSync(path.resolve(config.cache_path, md5(url) + '.json'), JSON.stringify(data));
}

module.exports = cache;