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

        attrs:null,

        layerindex: undefined,

        input: null,

        initialize: function (attrs) {
            //var _self = this;
            console.log('modal:' + this.id);
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
                if(e.which == keyCode && pageId == id) {
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

        //openLayer: function (layerId, mainId, view) {
        //    pageId = id;
        //    layer.open({
        //        content: '<div class="for-layer">' + '内容' + '</div>',
        //        success: function (layero, index) {
        //            console.log(view);
        //            console.log(layero);
        //            view.render();
        //        },
        //        end: function () {
        //            pageId = mainId
        //        }
        //    });
        //
        //},

        closeLayer: function (index) {
            console.log('close layer');
            isModal = false;
            layer.close(index);
        },

        confirmHideLayer:function(pageid) {
            isModal = false;
            switch (pageid) {
                case window.PAGE_ID.LOGIN:
                    this.hideModal(window.PAGE_ID.LOGIN);
                    break;
                case window.PAGE_ID.SETDNS:
                    this.hideModal(window.PAGE_ID.SETDNS);
                    break;
                case window.PAGE_ID.MAIN:
                    this.hideModal(window.PAGE_ID.MAIN);
                    break;
                case window.PAGE_ID.MEMBER:
                    this.hideModal(window.PAGE_ID.MEMBER);
                    break;
                case window.PAGE_ID.RESTORDER:
                    this.hideModal(window.PAGE_ID.RESTORDER);
                    break;
                case window.PAGE_ID.RETURN_WHOLE:
                    this.hideModal(window.PAGE_ID.RETURN_WHOLE);
                    break;
                case window.PAGE_ID.BILLING:
                    this.hideModal(window.PAGE_ID.BILLING);
                    break;
                case window.PAGE_ID.BILLING_RETURN:
                    this.hideModal(window.PAGE_ID.BILLING_RETURN);
                    break;
                case window.PAGE_ID.RETURN_FORCE:
                    this.hideModal(window.PAGE_ID.RETURN_FORCE);
                    break;
                case window.PAGE_ID.CHECKING:
                    this.hideModal(window.PAGE_ID.CHECKING);
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
                for (var i = 0;i < directives.length; i++) {
                    websocket.send(directives[i] + content[i]);
                }
            } else {
                toastr.warning('没有连接到硬件，请检查硬件连接');
            }
        },

        render: function () {
            console.log('layer render');
            var _self = this;
            this.$el.html(this.template(this.model.toJSON()));
            this.onLayerShown();
            setTimeout(function () {
                $(_self.input).focus();
            }, 300)
            //$('.cbtn').mouseup(function () {
            //    $(_self.input).focus();
            //});
            return this;
        }

    });

    return BaseLayerView;
});