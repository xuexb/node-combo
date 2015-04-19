/**
 * 弹出层插件
 * @namespace dialog
 */



define(function(require) {
    'use strict';
    
    var jQuery = require('../jquery');

    var _templates = require('./base.tpl');

    require('./base.css');


    return (function(window, document, $, undefined) {

        var _count = 0,
            $window = $(window),
            $document = $(document),
            _expando = 'Dialog' + (+new Date());

        /**
         * 弹出层构架函数
         */
        var Dialog = function(config, ok, cancel) {
            var api;
            config = config || {}; //如果没有配置参数

            // 合并
            config = $.extend(true, {}, Dialog.defaults, config);

            //如果已经弹出， id为唯一标识
            config.id = config.id || _expando + _count;
            api = Dialog.list[config.id];
            if (api) { //如果缓存里有
                return api.zIndex(); //去操作焦点.focus();//置顶该实例并返回
            }


            //如果是写的string
            if (typeof config === 'string') {
                config = {
                    content: config
                }
            }


            //
            if (!$.isArray(config.button)) { //如果参数的button不是数组则让其为数组，因为后面要进行push操作追加
                config.button = [];
            }


            // 确定按钮
            if (ok !== undefined) {
                config.ok = ok;
            }

            if (config.ok) { //如果有确认按钮则追加到button数组里
                config.button.push({
                    id: 'ok',
                    value: config.okValue,
                    callback: config.ok,
                    focus: true, //确认按钮默认为聚焦状态
                    highlight: true //高亮
                });
            }


            // 取消按钮
            if (cancel !== undefined) {
                config.cancel = cancel;
            }

            if (config.cancel) { //如果有取消按钮则追加到button数组里
                config.button.push({
                    id: 'cancel',
                    value: config.cancelValue,
                    callback: config.cancel
                });
            }

            // 更新 zIndex 全局配置
            Dialog.defaults.zIndex = config.zIndex; //把参数里的zindex更新到全局对象里

            _count++; //让标识+1，防止重复
            Dialog.list[config.id] = this;
            return this._create(config);
        }

        Dialog.version = '6.0'; //版本

        Dialog.prototype = { //采用jQuery无需new返回新实例
            /**
             * 内部触发事件
             */
            _trigger: function(type) {
                var self = this,
                    listeners = self._getEventListener(type),
                    i = 0,
                    len = listeners.length;

                for (;i < len; i++) {
                    listeners[i].call(self);
                }
            },

            /**
             * 添加事件
             * @param   {String}    事件类型
             * @param   {Function}  监听函数
             */
            on: function(type, callback) {
                var self = this;

                if (type.indexOf('button:') === 0) {
                    type = type.slice(7);
                    if (!self._callback[type]) {
                        self._callback[type] = {};
                    }
                    self._callback[type].callback = callback;
                } else {
                    self._getEventListener(type).push(callback);
                }
                return self;
            },


            /**
             * 删除事件
             * @param   {String}    事件类型
             * @param   {Function}  监听函数
             */
            off: function(type, callback) {
                var self = this,
                    listeners,
                    i;

                if (type.indexOf('button:') === 0) {
                    delete self._callback[type.slice(7)];
                } else {
                    listeners = self._getEventListener(type);
                    if ('function' === typeof callback) {
                        for (i = 0; i < listeners.length; i++) {
                            if (callback === listeners[i]) {
                                listeners.splice(i--, 1);
                            }
                        }
                    } else {
                        listeners.length = 0;
                    }
                }



                return self;
            },


            // 获取事件缓存
            _getEventListener: function(type) {
                var listener = this._listener;
                if (!listener[type]) {
                    listener[type] = [];
                }
                return listener[type];
            },

            _create: function(config) {
                var self = this;

                self._listener = {}; //v6事件空间
                self._callback = {}; //按钮事件空间
                self._dom = {}; //jQuery对象
                // self.visibled = true;
                // self.locked = false;//
                // self.closed = false;//设置关闭标识
                self.config = config; //把参数引用到对象上

                self._createHTML(config); //输出html


                //添加对iframe的支持
                if (config.url) {
                    self._$('wrap').addClass('ui-dialog-iframe');

                    self._dom.iframe = $('<iframe />')
                        .attr({
                            src: config.url,
                            name: config.id,
                            // width: '100%',
                            // height: '100%',
                            allowtransparency: 'yes',
                            frameborder: 'no',
                            scrolling: 'no'//ie7下有滚动条
                        }).on('load', function() {
                            self.iframeAuto();
                        });

                    config.content = self._dom.iframe[0];
                    self.on('close', function() {
                        // 重要！需要重置iframe地址，否则下次出现的对话框在IE6、7无法聚焦input
                        // IE删除iframe后，iframe仍然会留在内存中出现上述问题，置换src是最容易解决的方法
                        this._$('iframe').attr('src', 'about:blank').remove();
                    });
                }



                if(config.skin){
                    self._$('wrap').addClass(config.skin);
                }

                self._$('wrap').css('position', config.fixed ? 'fixed' : 'absolute'); //定位

                self._$('close').click(function() {
                    self._click('cancel');
                    // self._click('close');
                });

                self.button.apply(self, config.button); //处理按钮组

                self.title(config.title) //设置标题
                .content(config.content) //设置内容
                .width(config.width) //设置宽高
                .height(config.height) //设置宽高
                .time(config.time) //设置自动关闭
                .position() //重置位置
                .zIndex() //置顶
                ._addEvent(); //绑定事件

                

                self[config.visible ? 'show' : 'hide'](); //去焦点.focus();//是否显示

                if(config.lock){
                    self.lock(); //如果有遮罩
                }


                if(config.initialize){
                    config.initialize.call(self); //如果有初始化参数则call下
                }

                return self; //返回实例
            },

            /**
             * 设置iframe自适应
             */
            iframeAuto: function() {
                var self = this,
                    config = self.config,
                    $iframe = self._dom.iframe,
                    test;

                if ($iframe && (!config.width || !config.height)) {
                    try {
                        // 跨域测试
                        test = $iframe[0].contentWindow.frameElement;
                    } catch (e) {}

                    if (test) {

                        if (!config.width) {
                            self.width($iframe.contents().width());
                        }
                        if (!config.height) {
                            self.height($iframe.contents().height());
                        }
                    }
                }
                return self;
            },

            /**
             * 设置内容
             * @param {String} 内容 (可选)
             */
            content: function(message) {
                this._$('content').html(message); //设置内容不解释
                // this._reset();//重置下位置
                return this.position();
            },


            /**
             * 设置标题
             * @param {(String|Boolean)} 标题内容. 为 false 则隐藏标题栏
             */
            title: function(content) {

                var className = 'ui-dialog-noTitle'; //没有标题时的class

                if (content === false) { //如果参数为false才不显示标题
                    this._$('title').hide().html('');
                    this._$('wrap').addClass(className);
                } else {
                    this._$('title').show().html(content);
                    this._$('wrap').removeClass(className);
                }

                return this;
            },



            /** @inner 位置居中 */
            position: function() {

                return this.__center();
            },

            /**
             * 内部居中
             */
            __center: function() {
                var wrap = this._$('wrap')[0],
                    fixed = this.config.fixed, //判断是否为fixed定位
                    dl = fixed ? 0 : $document.scrollLeft(), //如果不是则找到滚动条
                    dt = fixed ? 0 : $document.scrollTop(), //同上
                    ww = $window.width(), //窗口的宽
                    wh = $window.height(), //窗口的高
                    ow = wrap.offsetWidth, //当前弹层的宽
                    oh = wrap.offsetHeight, //同上
                    left = (ww - ow) / 2 + dl,
                    top = (wh - oh) / 2 + dt; //(wh - oh) * 382 / 1000 + dt;//项目不让使用黄金比例

                wrap.style.left = Math.max(parseInt(left), dl) + 'px';
                wrap.style.top = Math.max(parseInt(top), dt) + 'px';

                return this;
            },



            width: function(value) {
                var self = this;
                //如果是获取宽
                if (value === undefined) {
                    return self._$('wrap').width();
                }
                self._$('content').width(value);
                return self.position();
            },

            height: function(value) {
                var self = this;
                //如果是获取高
                if (value === undefined) {
                    return self._$('wrap').height();
                }
                self._$('content').height(value);
                return self.position();
            },

            button: function() {


                var self = this,
                    buttons = self._$('buttons')[0], //dom下
                    callback = self._callback, //0000事件空间
                    ags = [].slice.call(arguments);

                var i = 0,
                    val, value, id, isNewButton, button, className;

                for (; i < ags.length; i++) {

                    val = ags[i]; //当前的按钮对象

                    id = val.id || value; //找到id


                    value = val.value || (callback[id] && callback[id].value) || '确定'; //如果没有设置value


                    isNewButton = !callback[id]; //是否已经存在
                    button = isNewButton ? document.createElement('a') : callback[id].elem; //如果已存在则拿dom，否则创建dom
                    button.href = '#'; //你懂的
                    className = 'ui-dialog-button'; //按钮class

                    if (isNewButton) { //如果为新按钮
                        callback[id] = {};
                    }

                    //写入到按钮和空间上
                    button.innerHTML = callback[id].value = value;


                    //如果禁用
                    if (val.disabled) {
                        className += ' ui-dialog-button-disabled'; //禁用的class
                    } else {
                        //如果有回调
                        if (val.callback) {
                            callback[id].callback = val.callback;
                        }
                    }

                    if (val.focus) { //如果为聚焦
                        if(self._focus){
                            self._focus.removeClass('ui-dialog-button-focus'); //移除老聚焦的按钮
                        }
                        className += ' ui-dialog-button-focus'; //给当前添加聚焦
                        self._focus = $(button);
                    }

                    if (val.highlight) { //如果高亮
                        className += ' ui-dialog-button-on';
                    }

                    if (val.className) { //如果配置的按钮有class则追加下
                        className += ' ' + val.className;
                    }



                    button.className = className;


                    button.setAttribute(_expando + 'callback', id); //为了委托事件用

                    if (isNewButton) { //如果为新按钮则追加到dom
                        callback[id].elem = button;
                        buttons.appendChild(button);
                    }
                }

                buttons.style.display = ags.length ? '' : 'none';

                if(self._focus){
                    self._focus.focus(); //只操作按钮的焦点，而不管窗口的焦点，否则ie6有严重bug
                }

                return self;
            },


            /** 显示对话框 */
            show: function() {
                //this.dom.wrap.show();
                var self = this;

                if(self.visibled === true){
                    return self;
                }

                self.visibled = true;

                self._$('wrap').show();
                self._$('wrap').addClass('ui-dialog-show');

                if (self._dom.mask) {
                    self._dom.mask.show();
                }

                self._trigger('show');

                return self;
            },


            /** 隐藏对话框 */
            hide: function() {
                //this.dom.wrap.hide();
                var self = this;

                if(self.visibled === false){
                    return self;
                }

                self.visibled = false;

                self._$('wrap').hide();
                self._$('wrap').removeClass('ui-dialog-show');

                if (self._dom.mask) {
                    self._dom.mask.hide();
                }




                self._trigger('hide');

                return self;
            },


            /** 关闭对话框 */
            close: function() {
                var self = this,
                    key,
                    beforeunload;

                if (self.closed) {
                    return self;
                }

                beforeunload = self.config.beforeunload;

                if (beforeunload && beforeunload.call(self) === false) {
                    return self;
                }


                if (Dialog.focus === self) {
                    Dialog.focus = null;
                }




                self._trigger('close');


                self.time().unlock(); //._removeEvent();//jQuery会自己卸载
                delete Dialog.list[self.config.id];
                self._$('wrap').remove();



                //采用v6的删除方法，减少资源
                for (key in self) {
                    delete self[key];
                }

                self.closed = true;


                return self;
            },


            /**
             * 定时关闭
             * @param {Number} 单位毫秒, 无参数则停止计时器
             */
            time: function(time) {

                var self = this,
                    timer = self._timer;

                if(timer){
                    clearTimeout(timer);
                }

                if (time) {
                    self._timer = setTimeout(function() {
                        self._click('close');
                    }, time);
                }


                return self;
            },

            /** 置顶对话框 */
            zIndex: function() {

                var /*dom = this.dom,*/
                    self = this,
                    top = Dialog.focus,
                    index = Dialog.defaults.zIndex++;

                // 设置叠加高度
                self._$('wrap').css('zIndex', index);
                
                if(self._dom.mask){
                    self._dom.mask.css('zIndex', index - 1);
                }

                // 设置最高层的样式
                if(top){
                    top._$('wrap').removeClass('ui-dialog-focus');
                }
                Dialog.focus = self;
                self._$('wrap').addClass('ui-dialog-focus');

                return self;
            },


            /** 设置屏锁 */
            // 需要优化
            lock: function() {

                var self = this,
                    config = self.config,
                    div,
                    css;

                if (self.locked) {
                    return self;
                }

                div = document.createElement('div');
                css = {
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    display: 'none'
                }



                div.className = 'ui-dialog-mask user-select-none';

                if(config.backgroundColor){
                    css['backgroundColor'] = config.backgroundColor;
                }
                if(config.backgroundOpacity){
                    css['opacity'] = config.backgroundOpacity;
                }



                document.body.appendChild(div);


                if(self.visibled){
                    css.display = 'block';   
                }

                self._dom.mask = $(div).css(css);/*.on('dblclick', function() {
                    self._click('close');
                })*/

                self.locked = true;



                self.zIndex()._$('wrap').addClass('ui-dialog-lock');
                return self;
            },


            /** 解开屏锁 */
            unlock: function() {
                var self = this;
                if (!self.locked) {
                    return self;
                }

                self._$('mask').remove();

                self._$('wrap').removeClass('ui-dialoge-lock');
                self.locked = false;

                //删除元素引用
                delete self._dom.mask;

                return self;
            },


            // 获取元素
            _createHTML: function() {
                var $wrap = $('<div />').css({
                    position: 'absolute',
                    left: '-9999em',
                    top: 0,
                    outline: 'none'
                }).attr({
                    'role': this.config.lock ? 'alertdialog' : 'dialog',
                    'tabindex': -1
                });

                $wrap[0].innerHTML = Dialog._templates;
                document.body.appendChild($wrap[0]);
                // $(document.body).append($wrap); //插入到前面ie67有问题
                // document.body.insertBefore(wrap, document.body.firstChild);
                this._dom.wrap = $wrap;
            },

            //获取jQuery对象
            _$: function(i) {
                var dom = this._dom;
                return dom[i] || (dom[i] = dom.wrap.find('[data-dom=' + i + ']'));
            },


            // 按钮回调函数触发
            _click: function(id) {
                var self = this,
                    fn = self._callback[id] && self._callback[id].callback;

                return typeof fn !== 'function' || fn.call(self) !== false ?
                    self.close() : self;
            },



            // 事件代理
            _addEvent: function() {

                var self = this;
                /*,
                dom = this.dom;*/

                // 优化事件代理
                self._$('buttons').on('click', 'a', function() {
                    var callbackID,
                        $this = $(this);

                    if (!$this.hasClass('ui-dialog-button-disabled')) {
                        callbackID = $this.attr(_expando + 'callback');
                        if(callbackID){
                            self._click(callbackID);
                        }
                    }

                    return !1;
                });

                self._$('wrap').on('mousedown', function() {
                    self.zIndex();
                });
            }
            /*,


        // 卸载事件代理 不用卸载, 因为在remove的时候会自动卸载
        _removeEvent: function() {
            this._$('wrap').unbind();
        }*/

        }



        // 快捷方式绑定触发元素
        // $.fn.dialog = $.fn.Dialog = function() {
        //     var config = arguments;
        //     this[this.live ? 'live' : 'bind']('click', function() {
        //         Dialog.apply(this, config);
        //         return false;
        //     });
        //     return this;
        // };



        /** 最顶层的对话框API */
        Dialog.focus = null;



        /**
         * 根据 ID 获取某对话框 API
         * @param {String} 对话框 ID
         * @return {Object} 对话框 API (实例)
         */
        Dialog.get = function(id) {
            var iframe,
                list = Dialog.list,
                key;

            // 从 iframe 传入 window 对象
            if (id && id.frameElement) {
                iframe = id.frameElement;
                for (key in list) {
                    if (list[key]._dom.iframe && list[key]._dom.iframe[0] === iframe) {
                        return list[key];
                    }
                }
            } else if (id) {
                return list[id];
            } else {
                return list;
            }
        }

        Dialog.list = {};



        //// 全局快捷键
        //$(document).bind('keydown', function (event) {
        //    var target = event.target,
        //        nodeName = target.nodeName,
        //        rinput = /^input|textarea$/i,
        //        api = Dialog.focus,
        //        keyCode = event.keyCode;

        //    if (!api || rinput.test(nodeName) && target.type !== 'button') {
        //        return;
        //    };
        //    
        //    // ESC
        //    keyCode === 27 && api._click('cancel');
        //});


        // 锁屏限制tab
        // function focusin(event) {
        //     var api = Dialog.focus;
        //     if (api && api.locked && !api.dom.wrap[0].contains(event.target)) {
        //         event.stopPropagation();
        //         api.dom.outer[0].focus();
        //     }
        // }

        // if ($.fn.live) {
        //     $('body').live('focus', focusin);
        // } else if (document.addEventListener) {
        //     document.addEventListener('focus', focusin, true);
        // } else {
        //     $(document).bind('focusin', focusin);
        // }



        // 浏览器窗口改变后重置对话框位置
        $window.bind('resize', function() {
            var id;
            for (id in Dialog.list) {
                Dialog.list[id].position();
            }
        });



        // 可用 dialog._$(name) 获取 data-dom 的jQuery对象
        // 已知dom:  inner,title,close,content,footer,buttons,header
        Dialog._templates =  _templates;



        /**
         * 默认配置
         */
        Dialog.defaults = {

            // 消息内容
            content: '<div class="ui-dialog-loading">加载中</div>',

            // 标题
            title: '\u63D0\u793A',

            // 自定义按钮
            button: null,

            // 确定按钮回调函数
            ok: null,

            // 取消按钮回调函数
            cancel: null,

            // 对话框初始化后执行的函数
            initialize: null,

            // 对话框关闭前执行的函数
            beforeunload: null,

            // 确定按钮文本
            okValue: '\u786E\u5B9A',

            // 取消按钮文本
            cancelValue: '\u53D6\u6D88',

            // 内容宽度
            width: '',

            // 内容高度
            height: '',

            // 皮肤名(多皮肤共存预留接口)
            skin: '',

            // 自动关闭时间(毫秒)
            time: 0,

            // 初始化后是否显示对话框
            visible: true,

            // 是否锁屏
            lock: false,

            // 是否固定定位
            fixed: false,

            // 对话框叠加高度值(重要：此值不能超过浏览器最大限制)
            zIndex: 3e4,

            backgroundColor: '',

            backgroundOpacity: ''
        }



        Dialog.alert = function(str, fn) {
            var options = {};


            if ('string' === typeof str) {
                options = {
                    content: str,
                    beforeunload: fn
                }
            } else if($.isPlainObject(str)){
                options = str;
            }

            return new Dialog($.extend({
                skin: 'ui-dialog-alert',
                width: 380,
                fixed: 1,
                lock: 1,
                ok: 1,
                title: !1
            }, options));
        }


        Dialog.confirm = function(str, fn, cancel) {
            var options = {};


            if ('string' === typeof str) {
                options = {
                    content: str,
                    ok: fn,
                    cancel: cancel
                }
            } else if($.isPlainObject(str)){
                options = str;
            }

            return new Dialog($.extend({
                skin: 'ui-dialog-alert',
                width: 380,
                fixed: 1,
                lock: 1,
                ok: 1,
                title: !1,
                cancel: options.cancel === undefined ? 1 : options.cancel
            }, options));
        }


        /**
         * 成功、错误、警告
         * @memberOf dialog
         * @function
         * @param   {(object | string)}    options    dialog参数对象或者字符串
         * @param   {number}              num        自动关闭的倒计时， ms
         * @return  {object}                         dialog对象
         * @example
         *     1: dialog.success("删除成功");
         *     2: dialog.error("分类不存在",4000);
         *     3: dialog.warning("您不是管理员");
         */
        $.each(['success', 'error', 'warning'], function(i, that) {
            Dialog[that] = function(options, num) {
                if ('string' === typeof options) {
                    options = {
                        content: options,
                        time: 'function' === typeof num ? 0 : num,
                        beforeunload: 'function' === typeof num ? num : 0
                    }
                }
                options = options || {};
                options.time = options.time || 2 * 1e3;

                options.content = '<p>' + options.content + '</p>\
                    <i class="ui-dialog-tips-icon ui-dialog-tips-' + that + '-icon"></i>';
                options.skin = 'ui-dialog-tips';
                options.fixed = 1;
                options.title = options.cancel = false;
                return new Dialog(options);
            };
        });


        return Dialog;
    }(window, document, jQuery));
});