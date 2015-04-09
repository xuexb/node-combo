var http = require('http');
var Fs = require('fs');
var Path = require('path');


var Config = require('./package.json');
var cache = require('./lib/cache');

var mine = {
    "css": "text/css",
    "gif": "image/gif",
    "html": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "text/javascript",
    "json": "application/json",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "txt": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "xml": "text/xml"
};


var server = http.createServer(function(request, response) {
    var url = request.url.substr(1),
        result = '',
        url_data;

    //如果不包含？？则认为不需要处理
    if (url.indexOf('??') === -1) {
        response.writeHead(401, {
            'Content-Type': 'text/plain'
        });
        response.write('This is not res!');
        response.end();
        return false;
    }

    //如果有缓存
    if(Config.cache){

        //如果命中
        if(cache.check(url, response) === true){
            return false;
        }
    }

    //路径数组
    url_data = require('./lib/url')(url);


    // console.log(url_data);

    //遍历路径 
    url_data.files.forEach(function(value){
        //如果文件存在
        if(Fs.existsSync(value.path)){
            result += require('./lib/load/'+ value.ext)(value);
        }
    });

    if(result === ''){
        response.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        response.end('<h1>404</h1>');
    } else {
        if(Config.cache){
            cache.write(url, result);
        }

        response.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        response.end(result);
    }
    
    return;
});
server.listen(Config.port);