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

        },

        modalInitPage: function () {
            console.log(this.attrs);
            var _self = this;
            this.model = new KeyTipsModel();
            this.collection = new KeyTipsCollection();
            this.collection.set(storage.get(system_config.SETTING_DATA_KEY,system_config.SHORTCUT_KEY,this.attrs));
            //$('.modal').on('show.bs.modal', function () {
            //    _self.renderHotKeys();
            //});
            this.renderHotKeys();
            $('.modal').on('shown.bs.modal', function () {
                _self.renderHotKeys();
            });
        },

        renderHotKeys: function () {
            this.$el.html(this.template(this.collection.toJSON()));
            return this;
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.TIP_MEMBER, window.KEYS.Esc , function () {
                console.log(_self.attrs);
                switch (_self.attrs) {
                    case 'MAIN_PAGE':
                        _self.hideModal(window.PAGE_ID.MAIN);
                        break;
                    case 'MEMBER_PAGE':
                        _self.hideModal(window.PAGE_ID.MEMBER);
                        break;
                    case 'RESTORDER_PAGE':
                        _self.hideModal(window.PAGE_ID.RESTORDER);
                        break;
                    case 'RETURNWHOLE_PAGE':
                        _self.hideModal(window.PAGE_ID.RETURN_WHOLE);
                        break;
                    case 'BILLING_PAGE':
                        _self.hideModal(window.PAGE_ID.BILLING);
                        break;
                    case 'BILLING_RETURN_PAGE':
                        _self.hideModal(window.PAGE_ID.BILLING_RETURN);
                        break;
                    case 'RETURNFORCE_PAGE':
                        _self.hideModal(window.PAGE_ID.RETURN_FORCE);
                        break;
                    case 'CHECKING_PAGE':
                        _self.hideModal(window.PAGE_ID.CHECKING);
                        break;
                }
            });
        }

    });

    return kMemberView;
});