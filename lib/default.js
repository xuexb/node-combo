module.exports = {
    base: "./",//根路径
    port: 88,//端口
    alias: {},//别名
    nginx: true,//是否nginx代理
    
    cache: true,//是否开启缓存文件，如果为false下面2个则成为浮云
    cache_path: "./__cache/",//缓存文件的路径，基于base
    expiration_time: 1000 * 60 * 60 * 24 * 10,//文件过期时间,单位ms
}