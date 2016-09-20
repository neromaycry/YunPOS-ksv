/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-confirm/model',
    'text!../../moduals/modal-confirm/contenttpl.html',
    'text!../../moduals/modal-confirm/tpl.html'
], function (BaseModalView, ConfirmModel, contenttpl, tpl) {

    var confirmView = BaseModalView.extend({

        id: "confirmView",

        template: tpl,

        template_content:contenttpl,

        events: {

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
                switch (_self.attrs.pageid) {
                    case window.PAGE_ID.MAIN:
                        _self.hideModal(window.PAGE_ID.MAIN);
                        break;
                    case window.PAGE_ID.MEMBER:
                        _self.hideModal(window.PAGE_ID.MEMBER);
                        break;
                    case window.PAGE_ID.RESTORDER:
                        _self.hideModal(window.PAGE_ID.RESTORDER);
                        break;
                    case window.PAGE_ID.RETURN_WHOLE:
                        _self.hideModal(window.PAGE_ID.RETURN_WHOLE);
                        break;
                    case window.PAGE_ID.BILLING:
                        _self.hideModal(window.PAGE_ID.BILLING);
                        break;
                    case window.PAGE_ID.BILLING_RETURN:
                        _self.hideModal(window.PAGE_ID.BILLING_RETURN);
                        break;
                    case window.PAGE_ID.RETURN_FORCE:
                        _self.hideModal(window.PAGE_ID.RETURN_FORCE);
                        break;
                    case window.PAGE_ID.CHECKING:
                        _self.hideModal(window.PAGE_ID.CHECKING);
                        break;
                }
            });
            this.bindModalKeyEvents(window.PAGE_ID.CONFIRM, window.KEYS.Enter, function () {
                _self.attrs.callback();
                _self.hideModal(window.PAGE_ID.MAIN);
            });
        }

    });

    return confirmView;
});