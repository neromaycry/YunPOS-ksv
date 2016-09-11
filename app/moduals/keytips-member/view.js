/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/keytips-member/model',
    'text!../../moduals/keytips-member/tpl.html',
], function (BaseModalView,KMemberModel, tpl) {

    var kMemberView = BaseModalView.extend({

        id: "kMemberView",

        template: tpl,

        events: {

        },

        modalInitPage: function () {
            this.model = new KMemberModel();

        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.TIP_MEMBER, window.KEYS.Esc , function () {
                _self.hideModal(window.PAGE_ID.MEMBER);
            });
        }

    });

    return kMemberView;
});