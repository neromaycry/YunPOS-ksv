/**
 * Created by gjwlg on 2016/11/20.
 */
define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {

    var BaseLayerView = Backbone.View.extend({

        el: '.for-layer',

        attrs: null,

        layerindex: undefined,

        input: null,

        initialize: function (attrs) {
            //var _self = this;
            console.log('modal:' + this.id);
            this.undelegateEvents();
            //$(document).unbind('keyup');
            //$(document).unbind('keydown');
            isModal = true;
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
            this.delegateEvents();
            this.LayerInitPage();
            this.bindLayerKeys();
            //setTimeout(function () {

            //}, 500)
        },

        LayerInitPage: function () {

        },

        onLayerShown: function () {

        },

        bindLayerKeys: function () {

        },

        bindLayerKeyEvents: function (id, keyCode, callback) {
            $(document).keyup(function (e) {
                e = e || window.event;
                console.log(e.which);
                if (e.which == keyCode && pageId == id) {
                    callback();
                }
            });
            //$(document).keyup(function (e) {
            //    e = e || window.event;
            //    var i = _.indexOf(keyCodes, e.which);
            //    if (i != -1) {
            //        callbacks[i]();
            //    }
            //});
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
                title: title,
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
                    pageId = mainId;
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

        parseMagTracks: function (value) {
            //var value = ';6222620910021970482=2412220905914925?996222620910021970482=1561560500050006021013000000010000024120===0914925905;';
            var index1, index2, track1, track2, track3;
            //var value = '%768000001 383837934874352?;768000001?;383837934874352?';
            var str = value.charAt(0);
            console.log(str);
            if (str == '%') {
                index1 = value.indexOf('?');
                track1 = value.substring(1, index1);
                value = value.substring(index1 + 1);
                str = value.charAt(0);
                console.log('track1 str:' + str);
            } else {
                track1 = '*';
            }
            if (str == ';') {
                index2 = value.indexOf('?');
                track2 = value.substring(1, index2);
                value = value.substring(index2 + 1);
                str = value.charAt(0);
                console.log('track2 str:' + str);
            } else {
                track2 = '*';
            }
            if (str == ';') {
                track3 = value.substring(1, value.length - 1);
            } else {
                track3 = '*'
            }
            console.log('track1:' + track1 + ',track2:' + track2 + ',track3:' + track3);
            var tracks = [track1, track2, track3];
            return tracks;
        },


        /**
         * 关闭layer的通用方法
         * @param index 当前layer的index， 一般都传入layerindex这个window变量
         * 注意：如果layer所处页面中存在input，则需要在关闭时手动将焦点赋到input框上 $('input的selector').focus(),
         * 否则会出现失去焦点的bug
         */
        closeLayer: function (id) {
            console.log('close layer');
            pageId = id;
            layer.close(layerindex);
        },

        confirmHideLayer: function (pageid) {
            console.log('confirmHideLayer');
            switch (pageid) {
                case window.PAGE_ID.LOGIN:
                    this.closeLayer(window.PAGE_ID.LOGIN);
                    //$('input[name = username]').focus();
                    break;
                case window.PAGE_ID.SETDNS:
                    this.closeLayer(window.PAGE_ID.SETDNS);
                    break;
                case window.PAGE_ID.MAIN:
                    this.closeLayer(window.PAGE_ID.MAIN);
                    $('input[name = main]').focus();
                    break;
                case window.PAGE_ID.RETURN_WHOLE:
                    this.closeLayer(window.PAGE_ID.RETURN_WHOLE);
                    $('input[name = whole_return_order]').focus();
                    break;
                case window.PAGE_ID.BILLING:
                    this.closeLayer(window.PAGE_ID.BILLING);
                    $('input[name = billing]').focus();
                    break;
                case window.PAGE_ID.BILLING_RETURN:
                    this.closeLayer(window.PAGE_ID.BILLING_RETURN);
                    $('input[name = billingrt]').focus();
                    break;
                case window.PAGE_ID.RETURN_FORCE:
                    this.closeLayer(window.PAGE_ID.RETURN_FORCE);
                    $('input[name = sku_id]').focus();
                    break;
                case window.PAGE_ID.CHECKING:
                    this.closeLayer(window.PAGE_ID.CHECKING);
                    $('input[name = checking_date]').focus();
                    break;
                case PAGE_ID.PRINT:
                    this.closeLayer(PAGE_ID.PRINT);
                    $('input[name = bill_date]').focus();
                    break;
                case PAGE_ID.SETTING:
                    this.closeLayer(PAGE_ID.SETTING);
                    break;
            }
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
                //toastr.warning('没有连接到硬件，请检查硬件连接');
                loading.hide();
                layer.msg('请检查硬件连接或检查电脑是否已启动socket程序', optLayerWarning);
            }
        },

        render: function () {
            console.log('layer render');
            var _self = this;
            this.$el.html(this.template(this.model.toJSON()));
            this.onLayerShown();
            setTimeout(function () {
                $(_self.input).focus();
            }, 300);
            $('.cbtn').mousedown(function () {
                console.log('baselayer mousedown');
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
            return this;
        }

    });

    return BaseLayerView;
});