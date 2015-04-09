/**
 * 主页
 * @author xieliang
 * @email admin@xuexb.com
 */

define(function(require){
    'use strict';
    var $ = require('../lib/zepto'),
        FixedDown = require('../lib/fixed-down/base'),
        Scroll = require('../lib/ajax-page/scroll');


    new Scroll({
        // url: '/test.json',
        url: '/api/index',
        wrap: window,
        page: 1,
        list: $('#J-list'),
        // imgLoadWidth: 640,
        // imgLoadHeight: 320,
        tpl: require('./index.tpl')
    });

    new FixedDown();
});


seajs.use('xl', function(){

});

$('body');