/**
 * url处理
 * @把地址栏的url解析，并生成绝对路径数组
 */

function url(str){
    str = str.replace('??', '@@');

    if(str.lastIndexOf('?') > -1){
        str = str.substr(0, str.lastIndexOf('?'));
    }

    var index = str.indexOf('@@');

    //得到路径前缀
    var Prefix = str.substr(0, index) || '';

    //如果不是以/结尾,但这里要判断如果为空
    if(Prefix && Prefix[Prefix.length - 1] !== '/'){
        Prefix += '/';
    } 

    //拼出前缀返回
    return str.substr(index + 2).split(',').map(function(val){
        return val[0] === '/' ? //如果是绝对路径则直接返回
            val.substr(1) : 
            Prefix + val;
    });
}


module.exports = url;