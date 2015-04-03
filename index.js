var http = require('http');
var Fs = require('fs');
var Path = require('path');

var Config = require('./package.json');

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
        result = '';

    //如果不包含？？则认为不需要处理
    if (url.indexOf('??') === -1) {
        response.writeHead(401, {
            'Content-Type': 'text/plain'
        });
        response.write('This is not res!');
        response.end();
        return false;
    }

    //路径数组
    url = require('./lib/url')(url);

    //遍历路径 
    url.forEach(function(value){
        var ext = Path.extname(value);
        if(ext){
            ext = ext.slice(1);
        } else {
            return;
        }


        //如果文件存在
        if(Fs.existsSync(value)){
            result += require('./lib/load/'+ ext)(value);
        }
    });

    if(result === ''){
        response.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        response.end('<h1>404</h1>');
    } else {
        response.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        response.end(result);
    }
    
    return;
});
server.listen(Config.port);