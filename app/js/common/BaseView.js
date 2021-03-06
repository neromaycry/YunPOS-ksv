/**
 * Created by lyting on 16-4-25.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'bootstrap',
    '../../moduals/layer-authcard/view',
    '../../moduals/layer-authcommand/view',
], function ($, _, Backbone, Bootstrap, LayerAuthCardView, LayerAuthCommandView) {

    var BaseView = Backbone.View.extend({

        attrs: null,

        is_modal_open: false,

        is_from_force: false,

        input: null,

        listheight: 0,//购物车的高度

        itemheight: 0,//每条商品的高度

        //listnum: 0,//购物车显示的商品数量

        n: 0,//

        /**
         * Backbone的view的初始化函数
         * @param attrs view生成时传入参数
         */
        initialize: function (attrs) {
            var _self = this;
            console.log(">>> " + this.id);  //打印当前view的id
            this.undelegateEvents();   // 解绑backbone事件，防止view再次生成时事件重复绑定的问题
            $(document).off('keydown');  //解绑键盘keydown事件
            $(document).off('mouseup');  //解绑鼠标mouseup事件
            //$(document).unbind('keydown');
            this.$el.empty().off();
            if (attrs) {
                this.attrs = attrs;
            }
            if (this.model) {
                this.collection = new Backbone.Collection.extend({model: this.model});
            }
            if (this.template) {
                // 加载默认模板
                this.$el.html(this.template);
                this.template = _.template(this.template);
            }

            this.initRouter();
            this.pageInit();
            this.stopListening();
            if (this.model) {
                // 注册 model change事件
                this.listenTo(this.model, "change", this.model_change);
            }
            if (this.collection) {
                // 注册 collection add remove reset 事件
                this.listenTo(this.collection, "add", this.collection_add);
                this.listenTo(this.collection, "remove", this.collection_remove);
                this.listenTo(this.collection, "reset", this.collection_reset);
            }
            this.delegateEvents();
            this.bindKeys();
            this.setPosLimit();
        },

        initRouter: function () {

        },

        /**
         * view生成时加载页面的方法
         */
        pageInit: function () {
        },

        model_change: function () {

        },
        collection_add: function () {

        },
        collection_remove: function () {

        },
        collection_reset: function () {

        },

        initOtherView: function () {

        },

        initPlugins: function () {

        },

        initLayoutHeight: function () {

        },

        /**
         * 模态框弹出公用方法
         * @param id 弹出的模态框的view的pageid 例如:window.PAGE_ID.MAIN,按需要向status_config里面添加pageid
         * @param view 弹出的模态框中的view
         */
        showModal: function (id, view) {
            $('.modal').modal('show', {keyboard: false});
            $('.modal').on('show.bs.modal', function (e) {
                pageId = id;
                view.render();
            });
        },

        /**
         * 模态框隐藏公用方法
         * @param id 返回的页面的view的pageid 例如:window.PAGE_ID.MAIN
         */
        hideModal: function (id) {
            isModal = false;
            $('.modal').modal('hide');
            $('.modal').on('hidden.bs.modal', function () {
                pageId = id;
            });
        },

        /**
         * 打开一般layer的通用方法
         * @param LayerId 即将打开的layer的pageid
         * @param mainId  layer所处的页面的pageid
         * @param title  layer的标题
         * @param View  layer中要加载的view
         * @param attrs  将要传到view中的参数
         * @param options  layer的参数
         * 示例：
         * var attrs = {
                page: 'MAIN_PAGE'
            };
         this.openLayer(PAGE_ID.LAYER_HELP, pageId, '帮助', LayerHelpView, attrs, {area: '600px'});
         */
        openLayer: function (LayerId, mainId, title, View, attrs, options) {
            var _self = this;
            options = _.extend({
                title: title,  //  layer的标题
                closeBtn: 0,  //  关闭按钮是否显示
                type: 1,
                offset: '150px',  // 和页面顶部的距离
                content: '<div class="for-layer">' + '</div>',
                success: function (layero, index) {
                    pageId = LayerId;
                    layerindex = index;
                    console.log('layerindex = ' + layerindex);
                },
                end: function () {
                    if (attrs) {
                        if (attrs.is_navigate) {
                            pageId = attrs.navigate_page;
                        } else {
                            pageId = mainId;
                        }
                        if (!attrs.setting_callback) {
                            console.log('setting_callback is null');
                        } else {
                            attrs.setting_callback();
                        }
                    } else {
                        pageId = mainId;
                    }
                    isModal = false;
                    $(document).off('keyup');
                    console.log('end:' + pageId);
                }
            }, options);
            layer.open(options);
            layer.ready(function () {
                var view = new View(attrs);
                view.render();
            });
        },

        /**
         * 打开确认layer的通用方法
         * @param LayerId  即将打开的layer的pageid
         * @param mainId  layer所处的页面的pageid
         * @param View  layer中要加载的view
         * @param attrs  将要传到view中的参数
         * @param options  layer的参数
         * 示例：
         * var attrs = {
                pageid: pageId,  //打开当前layer所处的页面
                content: '确定取消交易？',  //layer中要显示的内容
                is_navigate: false,  //确认后是否有跳页
                callback: function () {
                    //确认键的回调的代码
                }
            };
         this.openConfirmLayer(PAGE_ID.LAYER_CONFIRM, pageId, LayerConfirm, attrs, {area: '300px'});
         *
         */
        openConfirmLayer: function (LayerId, mainId, View, attrs, options) {
            options = _.extend({
                title: '请确认',
                closeBtn: 0,
                type: 1,
                offset: '150px',
                content: '<div class="for-layer">' + '</div>',
                success: function (layero, index) {
                    pageId = LayerId;
                    layerindex = index;
                    console.log('layerindex = ' + layerindex);
                },
                end: function () {
                    if (attrs.is_navigate && attrs.is_confirm) {
                        pageId = attrs.navigate_page;
                    } else {
                        pageId = mainId;
                    }
                    isModal = false;
                    $(document).off('keyup');
                    console.log('end:' + pageId);
                }
            }, options);
            layer.open(options);
            layer.ready(function () {
                var view = new View(attrs);
                view.render();
            })
        },

        /**
         * 键盘绑定公用方法
         * @param id 当前view的pageid
         * @param keyCode 将要绑定的键值
         * @param callback 对应将要绑定的回调函数
         */
        bindKeyEvents: function (id, keyCode, callback) {
            $(document).keydown(function (e) {
                e = e || window.event;
                console.log(e.which);
                if (e.which == keyCode && pageId == id) {
                    callback();
                }
            });
        },

        //bindModalKeyEvents: function (id, keyCode, callback) {
        //    $(document).keyup(function (e) {
        //        e = e || window.event;
        //        console.log(e.which);
        //        if(e.which == keyCode && pageId == id) {
        //            callback();
        //        }
        //    });
        //},

        bindKeys: function () {

        },
        /**
         * 与websocket通信的通用方法
         * @param directives 包含指令的数组
         * @param content 发送的指令对应的内容的数组
         * @param websocket websocket实例
         */
        sendWebSocketDirective: function (directives, content, websocket) {
            if (websocket.readyState == 1) {
                for (var i = 0; i < directives.length; i++) {
                    var directive = directives[i] + content[i];
                    console.log(directive);
                    websocket.send(directive);
                }
            } else {
                layer.msg('请检查本地是否已经启动webctrl程序', optLayerError);
            }
        },

        setPosLimit: function () {
            var isPosLimitSet = window.storage.isSet(system_config.SETTING_DATA_KEY, system_config.INIT_DATA_KEY, system_config.POS_LIMIT);
            if (isPosLimitSet) {
                var pos_limit = window.storage.get(system_config.SETTING_DATA_KEY, system_config.INIT_DATA_KEY, system_config.POS_LIMIT).toString();
                console.log(pos_limit);
                window.auth_discount = pos_limit.charAt(0); //折扣控制
                window.auth_report = pos_limit.charAt(1);  //报表控制
                window.auth_store = pos_limit.charAt(2);  //百货控制
                window.auth_receipt = pos_limit.charAt(3);  //打印小票
                window.auth_return = pos_limit.charAt(4);  //退货控制
                window.auth_delete = pos_limit.charAt(5);  //删除控制
                window.auth_quling = pos_limit.charAt(6);  //去零控制
                window.auth_cashdrawer = pos_limit.charAt(7);  //打开钱箱
                window.auth_reprint = pos_limit.charAt(8);  //复制小票
                window.auth_manualvip = pos_limit.charAt(9);  //手输vip控制
                window.auth_ecardswipe = pos_limit.charAt(10);  //一卡通刷卡输入口令
            }
        },

        /**
         * 控制客显屏中购物信息的显示与隐藏
         * @param displayMode 是否显示 'none'不显示  'block'显示
         * @param ids 显示与隐藏区域的id
         * @param isPacked 是否已打包 true为已打包，false为未打包（通过是否打包来判断是否执行此函数，防止程序因未打包而报错）
         */
        ctrlClientInfo: function (displayMode, ids, isPacked, isClientShow) {
            if (isPacked && isClientShow) {
                for (var i = 0; i < ids.length; i++) {
                    clientDom.getElementById(ids[i]).style.display = displayMode;
                }
            }
        },

        /**
         * 锁屏通用方法
         */
        lockScreen: function () {
            storage.set(system_config.LAST_PAGE, pageId);
            router.navigate('lockscreen', {trigger: true, replace: true});
        },

        addClickEvents: function () {
            var _self = this;
            $('.cbtn').mousedown(function () {
                $(this).addClass('clicked');
            });
            $('.cbtn').mouseup(function () {
                $(this).removeClass('clicked');
            });
            $('.cbtn').on('touchstart', function (e) {
                $(this).addClass('clicked');
            });
            $('.cbtn').on('touchend', function (e) {
                $(this).removeClass('clicked');
            });
            $('.numpad-ok').mousedown(function () {
                $(this).addClass('ok-clicked');
            });
            $('.numpad-ok').mouseup(function () {
                $(this).removeClass('ok-clicked');
            });
            $('.numpad-ok').on('touchstart', function (e) {
                $(this).addClass('ok-clicked');
            });
            $('.numpad-ok').on('touchend', function (e) {
                $(this).removeClass('ok-clicked');
            });
            $(document).mouseup(function () {
                if (!isModal) {
                    $(_self.input).focus();
                }
            });
            $(document).on('touchend', function (e) {
                if (!isModal) {
                    $(_self.input).focus();
                }
            });
        },

        getCurrentFormatDate: function () {
            var date = new Date();
            var seperator1 = "-";
            var seperator2 = ":";
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            var currentdate = year + seperator1 + month + seperator1 + strDate
                + " " + date.getHours() + seperator2 + date.getMinutes()
                + seperator2 + date.getSeconds();
            return currentdate;
        },

        /**
         * 判断权限控制通用方法
         * @param authtype 控制类型
         * @param accreditType 权限类型 '01'：单品优惠，'02'：折让，'03'：整单优惠，'04'：收银对账，'05'：单品退货，
         *                              '06'：整单退货，'08'：删除商品，'09'：取消交易，'10'：折让，'11'：vip是否允许手输
         * @param extra 额外参数
         * @param callback 权限通过后的回调
         */
        evalAuth: function (authtype, accreditType, extra, callback) {
            if (authtype == AUTH_CODE.GRANTED) {
                callback();
            } else if (authtype == AUTH_CODE.COMMAND) {
                var attrs = {
                    pageid: pageId,
                    is_navigate: false,
                    accredit_type: accreditType,
                    discount_rate: extra.discount_rate,
                    callback: function () {
                        callback();
                    }
                };
                this.openLayer(PAGE_ID.LAYER_AUTHCOMMAND, pageId, '需要口令验证', LayerAuthCommandView, attrs, {area: '300px'});

            } else if (authtype == AUTH_CODE.CARD) {
                var attrs = {
                    pageid: pageId,
                    is_navigate: false,
                    accredit_type: accreditType,
                    discount_rate: extra.discount_rate,
                    callback: function () {
                        callback();
                    }
                };
                this.openLayer(PAGE_ID.LAYER_AUTHCARD, pageId, '需要管理卡验证', LayerAuthCardView, attrs, {area: '300px'});
            }
        },

        render: function () {
            var _self = this;
            var _data = this.collection || this.model;
            var dataset = _data ? _data.toJSON() : {};
            this.$el.html(this.template(dataset));
            this.initOtherView();
            this.initPlugins();
            this.initLayoutHeight();
            //if (storage.isSet(system_config.IS_KEYBOARD_PLUGGED)) {
            //    var isKeyboardPlugged = storage.get(system_config.IS_KEYBOARD_PLUGGED);
            //    $('input').attr('readonly', !isKeyboardPlugged);
            //}
            this.addClickEvents();
            return this;
        },

        scrollDown: function (cartlist, lilist) {
            if (this.i < this.collection.length - 1) {
                this.i++;
            }
            if (this.i % this.listnum == 0 && this.n < parseInt(this.collection.length / this.listnum)) {
                this.n++;
                $('.' + cartlist).scrollTop(this.listheight * this.n);
            }
            $('#'+ lilist + (this.i)).addClass('cus-selected').siblings().removeClass('cus-selected');
        },
        /**
         * 购物车光标向上
         */
        scrollUp: function (cartlist, lilist){
            if (this.i > 0) {
                this.i--;
            }
            if ((this.i + 1) % this.listnum == 0 && this.i > 0) {
                this.n--;
                $('.' + cartlist).scrollTop(this.listheight * this.n);
            }
            $('#' + lilist + (this.i)).addClass('cus-selected').siblings().removeClass('cus-selected');
        },

    });
    return BaseView;

});
