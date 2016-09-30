/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-changing/model',
    'text!../../moduals/modal-changing/contenttpl.html',
    'text!../../moduals/modal-changing/tpl.html'
], function (BaseModalView, ConfirmModel, contenttpl, tpl) {

    var changingView = BaseModalView.extend({

        id: "changingView",

        template: tpl,

        template_content:contenttpl,

        events: {
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked'
        },

        modalInitPage: function () {
            console.log(this.attrs);
            this.template_content = _.template(this.template_content);
            this.model = new ConfirmModel();
            this.model.set({
                content:this.attrs.content
            });
            this.renderContent();
        },

        renderContent: function () {
            this.$el.find('.confirm-content').html(this.template_content(this.model.toJSON()));
            return this;
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.CONFIRM, window.KEYS.Esc , function () {
               _self.confirmHideModal(_self.attrs.pageid);
            });
            this.bindModalKeyEvents(window.PAGE_ID.CONFIRM, window.KEYS.Enter, function () {
                _self.attrs.callback();
                if (_self.attrs.is_navigate) {
                    _self.confirmHideModal(_self.attrs.navigate_page);
                } else {
                    _self.confirmHideModal(_self.attrs.pageid);
                }
            });
        },

        confirmHideModal:function(pageid) {
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

        onCancelClicked: function () {
            this.confirmHideModal(this.attrs.pageid);
        },

        onOKClicked: function () {
            this.attrs.callback();
            if (this.attrs.is_navigate) {
                this.confirmHideModal(this.attrs.navigate_page);
            } else {
                this.confirmHideModal(this.attrs.pageid);
            }
        }

    });

    return changingView;
});