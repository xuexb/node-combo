// file_no_cmd

/**
 * seajs配置
 * @description 对时间缀的支持
 */
;
(function(seajs) {
    'use strict';
    var version = (document.getElementById('seajsnode') || {}).src;

    if (version && version.indexOf('v=') > 0) {
        version = version.substr(version.indexOf('v=') - 1);
        seajs.config({
            map: [
                function(uri) {
                    return uri + version;
                }
            ]
        });
    }
})(window.seajs);