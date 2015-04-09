/**
 * 缓存
 */

var md5 = require('MD5');
var fs = require('fs');


var cache = {};

var cache_path = '../cache/';

/**
 * 检查是否命中
 * @param  {string} url 文件url
 * @return {boolean}
 */
cache.check = function(url, response){
    var uri = md5(url);
    var data = fs.existsSync(cache_path + uri +'.json');

    if(data){
        console.log('文件存在 ');
        if(new Date().getTime() > data.update_time + 1000 * 60){
            del(cache_path + uri +'.json');
            console.log('文件过期');
            return false;
        }
    } else {
        console.log('文件不存在 ');
        return false;
    }

    //输出文件
    response.write(data.code);
    response.end();

    return true;
}


cache.write = function(url, data){
    var uri = md5(url);

    var json = {
        code: data,
        update_time: new Date().getTime()
    }

    console.log(json);
    // console.log(JSON.stringify(json));
    json = (JSON.stringify(json));
    console.log(json);

    fs.writeSync('../cache/xx.json', json);
}

/**
 * 删除文件
 */
function del(url){
    fs.unlinkSync(url);
}


module.exports = cache;