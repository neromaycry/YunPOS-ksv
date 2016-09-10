/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseView',
    'text!../../moduals/keytips-member/tpl.html',
], function (BaseView, tpl) {

    var kMemberView = BaseView.extend({

        id: "kMemberView",

        el: '.modal-container',

        template: tpl,

        events: {

        },

        pageInit: function () {
            pageId = window.PAGE_ID.TIP_MEMBER;
        },

        initPlugins: function () {

        },

        bindKeys: function () {
            this.bindKeyEvents(pageId, window.KEYS.Esc , function () {
                var remodal = $('[data-remodal-id=modal]').remodal();
                remodal.close();
            });
        }

    });

    return kMemberView;
});