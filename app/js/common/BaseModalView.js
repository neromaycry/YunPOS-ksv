/**
 * Created by gjwlg on 2016/9/11.
 */
define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {

    var BaseModalView = Backbone.View.extend({

        el: '.modal',

        attrs: null,

        initialize: function (attrs) {
            console.log('modal:' + this.id);
            $(document).unbind('keyup');
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
            this.modalInitPage();
            this.bindModalKeys();
            $('.modal').on('shown.bs.modal', function () {
                $('.cbtn').mousedown(function () {
                    $(this).addClass('clicked');
                });
                $('.cbtn').mouseup(function () {
                    $(this).removeClass('clicked');
                });
            });
        },

        modalInitPage: function () {

        },

        onModalShown: function () {

        },

        bindModalKeys: function () {

        },

        bindModalKeyEvents: function (id, keyCode, callback) {
            $(document).keydown(function (e) {
                e = e || window.event;
                console.log(e.which);
                if (e.which == keyCode && pageId == id) {
                    callback();
                }
            });
        },

        showModal: function (id, view) {
            pageId = id;
            $('.modal').modal('show', {keyboard: false});
            $('.modal').on('show.bs.modal', function (e) {
                view.render();
            });
        },

        hideModal: function (id) {
            isModal = false;
            $('.modal').modal('hide');
            $('.modal').on('hidden.bs.modal', function () {
                pageId = id;
            });
        },

        confirmHideModal: function (pageid) {
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
                for (var i = 0; i < directives.length; i++) {
                    websocket.send(directives[i] + content[i]);
                }
            } else {
                toastr.warning('没有连接到硬件，请检查硬件连接');
            }
        },

        render: function () {
            console.log('modal render');
            var _self = this;
            this.$el.html(this.template(this.model.toJSON()));
            this.onModalShown();
            //$('.cbtn').mouseup(function () {
            //    $(_self.input).focus();
            //});
            return this;
        }

    });

    return BaseModalView;
});