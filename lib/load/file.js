var fs = require('fs');
var url = require('url');
var path = require('path');


module.exports = function (request_url, config){
    var result = {
        code: '404',
        type: 'html',
    }

    request_url = url.parse(request_url).pathname;

    console.log(request_url);

    //如果是文件
    if (fs.existsSync(request_url)) {
        result.type = path.extname(request_url) || '.text';
        result.type = result.type.substr(1);
        console.log(result.type)
        result.code = fs.readFileSync(request_url).toString() || '404';
    }

    return result;
}

