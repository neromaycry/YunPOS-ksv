/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/keytips-member/model',
    '../../moduals/keytips-member/collection',
    'text!../../moduals/keytips-member/tpl.html'
], function (BaseModalView,KeyTipsModel,KeyTipsCollection, tpl) {

    var kMemberView = BaseModalView.extend({

        id: "kMemberView",

        template: tpl,

        events: {
            'click .tipclose':'onCloseClicked'
        },

        modalInitPage: function () {
            var _self = this;
            this.model = new KeyTipsModel();
            this.collection = new KeyTipsCollection();
            this.collection.set(storage.get(system_config.SETTING_DATA_KEY,system_config.SHORTCUT_KEY,this.attrs));
            this.renderHotKeys();

        },

        renderHotKeys: function () {
            this.$el.html(this.template(this.collection.toJSON()));
            return this;
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.TIP_MEMBER, window.KEYS.Esc , function () {
                _self.tipsModalHide(_self.attrs);
            });
            this.bindModalKeyEvents(window.PAGE_ID.TIP_MEMBER, window.KEYS.T , function () {
                _self.tipsModalHide(_self.attrs);
            });
        },

        onCloseClicked: function () {
            this.tipsModalHide(this.attrs);
        },

        tipsModalHide: function (pageid) {
            switch (pageid) {
                case 'MAIN_PAGE':
                    this.hideModal(window.PAGE_ID.MAIN);
                    break;
                case 'MEMBER_PAGE':
                    this.hideModal(window.PAGE_ID.MEMBER);
                    break;
                case 'RESTORDER_PAGE':
                    this.hideModal(window.PAGE_ID.RESTORDER);
                    break;
                case 'RETURNWHOLE_PAGE':
                    this.hideModal(window.PAGE_ID.RETURN_WHOLE);
                    break;
                case 'BILLING_PAGE':
                    this.hideModal(window.PAGE_ID.BILLING);
                    break;
                case 'BILLING_RETURN_PAGE':
                    this.hideModal(window.PAGE_ID.BILLING_RETURN);
                    break;
                case 'RETURNFORCE_PAGE':
                    this.hideModal(window.PAGE_ID.RETURN_FORCE);
                    break;
                case 'CHECKING_PAGE':
                    this.hideModal(window.PAGE_ID.CHECKING);
                    break;
            }
        }

    });

    return kMemberView;
});