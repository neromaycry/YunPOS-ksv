/**
 * Created by lyting on 16-4-25.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'bootstrap'
], function ($, _, Backbone,Bootstrap) {

    var BaseView = Backbone.View.extend({

        attrs: null,

        is_modal_open:false,

        is_from_force:false,

        input:null,

        listheight:0,//购物车的高度

        itemheight:0,//每条商品的高度

        listnum:0,//购物车显示的商品数量

        n:0,//

        initialize: function (attrs) {
            var _self = this;
            console.log(">>> " + this.id);
            this.undelegateEvents();
            $(document).unbind('keyup');
            this.$el.empty().off();
            if (attrs) {
                this.attrs = attrs;
            }
            if (this.model) {
                this.collection = new Backbone.Collection.extend({model: this.model});
            }
            if (this.template) {
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
            //$('.modal').on('show.bs.modal', function () {
            //    alert('unbind keyup');
            //    $(document).unbind('keyup');
            //});
            //$('.modal').on('hide.bs.modal', function () {
            //    alert('bindkeys');
            //    _self.bindKeys();
            //});
        },

        initRouter: function () {

        },

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
            pageId = id;
            $('.modal').modal('show',{keyboard:false});
            $('.modal').on('show.bs.modal', function (e) {
               view.render();
            });
        },

        /**
         * 模态框隐藏公用方法
         * @param id 返回的页面的view的pageid 例如:window.PAGE_ID.MAIN
         */
        hideModal: function (id) {
            $('.modal').modal('hide');
            //$('.modal').on('hide.bs.modal', function () {
            //    pageId = id;
            //});
            pageId = id;
        },

        /**
         * 键盘绑定公用方法
         * @param id 当前view的pageid
         * @param keyCode 将要绑定的键值
         * @param callback 对应将要绑定的回调函数
         */
        bindKeyEvents: function (id,keyCode,callback) {
            $(document).keyup(function (e) {
                e = e || window.event;
                console.log(e.which);
                if(e.which == keyCode && pageId == id) {
                    callback();
                }
            });
        },

        bindModalKeyEvents: function (id, keyCode, callback) {
            $(document).keydown(function (e) {
                e = e || window.event;
                console.log(e.which);
                if(e.which == keyCode && pageId == id) {
                    callback();
                }
            });
        },

        bindKeys: function () {

        },

        /**
         * 控制客显屏中购物信息的显示与隐藏
         * @param displayMode 是否显示 'none'不显示  'block'显示
         * @param ids 显示与隐藏区域的id
         * @param isPacked 是否已打包 true为已打包，false为未打包（通过是否打包来判断是否执行此函数，防止程序因未打包而报错）
         */
        ctrlClientInfo: function (displayMode, ids, isPacked) {
            if (isPacked) {
                for (var i = 0;i< ids.length;i++) {
                    clientDom.getElementById(ids[i]).style.display = displayMode;
                }
            }
        },

        sendLargeData2Socket: function (str) {
            var SOCKET_ADDR = 'ws://127.0.0.1:2001/';
            wsClient.close();
            wsClient = new WebSocket(SOCKET_ADDR);
            var slicelength = 42;
            var n = str.length/slicelength+1;
            var i = 0;
            setInterval(function () {
                if (i<str.length/slicelength+1){
                    if (i == (n-1)) {
                        var laststr = str.slice(slicelength*i,str.length);
                        console.log(laststr);
                        wsClient.send(laststr);
                    } else {
                        var substr = str.slice(slicelength*i,slicelength*(i+1));
                        console.log('substr:' + substr);
                        wsClient.send(substr);
                    }
                }
                i++
            },10);
        },

        render: function () {
            var _self = this;
            console.log('render');
            var _data = this.collection || this.model;
            var dataset = _data ? _data.toJSON() : {};
            this.$el.html(this.template(dataset));
            this.initOtherView();
            this.initPlugins();
            this.initLayoutHeight();
            if (storage.isSet(system_config.IS_KEYBOARD_PLUGGED)) {
                var isKeyboardPlugged = storage.get(system_config.IS_KEYBOARD_PLUGGED);
                $('input').attr('readonly',!isKeyboardPlugged);
            }

            $('.cbtn').mousedown(function () {
                $(this).addClass('clicked');
            });
            $('.cbtn').mouseup(function () {
                $(this).removeClass('clicked');
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
            return this;
        }

    });
    return BaseView;

});
