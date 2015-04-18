var http = require('http');
var fs = require('fs');
var path = require('path');


var config = require('./default');
var cache = require('./cache');
var MIME = require('./mime.json');


function main(options) {
    //合并配置
    options = options || {};
    Object.keys(options).forEach(function(key) {
        config[key] = options[key];
    });

    //取得绝对路径
    config.base = path.resolve(path.resolve('./'), config.base);

    //得到缓存的绝对路径
    config.cache_path = path.resolve(config.base, config.cache_path);

    http.createServer(function(request, response) {
        var url = request.url.substr(1),
            result, url_data, alias;

        //如果不包含??
        if (url.indexOf('??') === -1) {

            //如果需要nginx处理的
            if (config.nginx) {
                response.writeHead(403, {
                    'Content-Type': MIME['text']
                });
                response.end('nginx');
                return false;
            }

            //加载普通文件
            result = require('./load/file')(url, config);
            response.writeHead(200, {
                'Content-Type': MIME[result.type]
            });
            response.end(result.code);
            return false;
        }

        //处理别名
        url = require('./alias')(url, config);

        //如果有缓存
        if (config.cache) {
            //如果命中
            if (cache.check(url, config, response) === true) {
                return false;
            }
        }

        result = '';

        //路径数组
        url_data = require('./url')(url, config);

        //遍历路径 
        url_data.files.forEach(function(value) {
            //如果文件存在
            if (fs.existsSync(value.path)) {
                result += require('./load/' + value.parse)(value);
            }
        });

        //如果为404
        if (result === '') {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.end('<h1>404</h1>');
        } else {
            //如果需要缓存，则写入文件
            if (config.cache) {
                cache.write(url, result, url_data.type, MIME[url_data.type], config);
            }

            response.writeHead(200, {
                'Content-Type': MIME[url_data.type]
            });
            response.end(result);
        }
    }).listen(config.port);


    console.log('启动端口: ' + config.port);

    //如果开启缓存
    if (config.cache) {
        console.log('根目录: ' + config.base);
        console.log('缓存目录: ' + config.cache_path);
    }
}


module.exports = main;