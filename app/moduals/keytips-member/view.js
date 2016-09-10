/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseView',
    'text!../../moduals/keytips-member/tpl.html',
], function (BaseView, tpl) {

    var kMemberView = BaseView.extend({

        id: "kMemberView",

        el: '.modal',

        template: tpl,

        events: {

        },

        pageInit: function () {
        },

        initPlugins: function () {
            this.bindModalKeys();
        },

        bindModalKeys: function () {
            this.bindKeyEvents(window.PAGE_ID.TIP_MEMBER, window.KEYS.Esc , function () {
                $('.modal').modal('hide');
                toastr.warning('keytips');
                pageId = window.PAGE_ID.MEMBER;
            });
        }

    });

    return kMemberView;
});