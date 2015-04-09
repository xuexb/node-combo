var http = require('http');
var fs = require('fs');


var config = require('./package.json');
var cache = require('./lib/cache');

var mine = {
    "css": "text/css",
    "js": "text/javascript",
}


var server = http.createServer(function(request, response) {
    var url = request.url.substr(1),
        result = '',
        url_data, alias;

    //如果不包含??则认为不需要处理
    //需要nginx代理
    if (url.indexOf('??') === -1) {
        response.writeHead(401, {
            'Content-Type': 'text/plain'
        });
        response.write('This is not res!');
        response.end();
        return false;
    }

    url = require('./lib/alias')(url);

    //如果有缓存
    if(config.cache){

        //如果命中
        if(cache.check(url, response) === true){
            return false;
        }
    }

    //路径数组
    url_data = require('./lib/url')(url);


    //遍历路径 
    url_data.files.forEach(function(value){
        //如果文件存在
        if(fs.existsSync(value.path)){
            result += require('./lib/load/'+ url_data.type)(value);
        }
    });

    //如果为404
    if(result === ''){
        response.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        response.end('<h1>404</h1>');
    } else {
        //如果需要缓存，则写入文件
        if(config.cache){
            cache.write(url, result, url_data.type, mine[url_data.type]);
        }

        response.writeHead(200, {
            'Content-Type': mine[url_data.type]
        });
        response.end(result);
    }
    
    return;
});
server.listen(config.port);