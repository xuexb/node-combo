/**
 * 加载js文件
 */

var fs = require('fs');
var config = require('../../package.json');
var ast = require('cmd-util').ast;



function load(url_data) {
    var path = url_data.path;
    var data = fs.readFileSync(path).toString();

    //如果为加载器
    if (data.indexOf('define') > -1) {
        data = cmd(data, url_data.uri) || '';
    } else {
        //如果需要压缩
        if (config.min) {
            data = min(data);
        }
    }


    return data;
}


/**
 * 处理cmd
 * @param  {string} data 代码
 */
function cmd(data, uri) {
    var astCache, meta
    var options = {}

    try {
        astCache = ast.getAst(data);
    } catch (e) {
        console.log(e);
    }

    meta = ast.parseFirst(astCache);

    //如果不是cmd
    if (!meta) {
        console.log('nocmd');
        return null;
    }



    var deps = [];
    // 只处理当前文件写的依赖
    if (meta.dependencies) {
        deps = meta.dependencies;
    }

    //生成文件
    astCache = ast.modify(astCache, {
        id: meta.id || uri, //cmd的id
        dependencies: deps
    });

    data = astCache.print_to_string({
        beautify: false,
        comments: false
    });

    return data;
}


/**
 * 压缩
 * @param  {string} data 代码
 */
function min(data) {
    return require('uglify-js').minify(data, {
        fromString: true,
        compress: {
            hoist_vars: true
        }
    }).code;
}

module.exports = load;