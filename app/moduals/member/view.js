/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    'text!../../../../moduals/member/tpl.html',
], function (BaseView, tpl) {

    var memberView = BaseView.extend({

        id: "memberView",

        el: '.views',

        template: tpl,

        events: {

        },

        pageInit: function () {
            pageId = window.PAGE_ID.MEMBER;
        },

        initPlugins: function () {

        },

        bindKeys: function () {
            this.bindKeyEvents(pageId,window.KEYS.Esc, function () {
                router.navigate('main',{trigger:true});
            });
        }

    });

    return memberView;
});