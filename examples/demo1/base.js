define(function(require) {
    var $ = require('../lib/jquery'),
        Dialog = require('../lib/dialog/base');

    var html = require('./base.tpl');

    var demo = {
        'default': function() {
            new Dialog({
                content: '我是测试的',
                title: '测试',
                width: 400,
                height: 200
            });
        },
        alert: function() {
            Dialog.alert('我是alert');
        },
        confirm: function() {
            Dialog.confirm('确认？', function() {

            });
        },
        success: function() {
            Dialog.success('你成功了');
        },
        error: function() {
            Dialog.error('一会再试吧');
        }
    }

    $('h1').text('加载完成，耗时：'+ (new Date().getTime() - __load) + 'ms');

    $('.box').html(html).on('click', 'button', function() {
        var fn = demo[this.getAttribute('data-type')];

        if(!fn){
            fn = demo['default'];
        }

        fn();
    });
});