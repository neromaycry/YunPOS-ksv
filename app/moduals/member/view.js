/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/keytips-member/view',
    'text!../../../../moduals/member/tpl.html',
], function (BaseView,KMemberView, tpl) {

    var memberView = BaseView.extend({

        id: "memberView",

        el: '.views',

        template: tpl,

        events: {

        },

        pageInit: function () {
            pageId = window.PAGE_ID.MEMBER;
            if (this.tipsView) {
                this.tipsView.remove();
            } else {
                this.tipsView = new KMemberView();
            }
        },

        initPlugins: function () {

        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(pageId, window.KEYS.Esc, function () {
                router.navigate('main',{trigger:true});
            });
            this.bindKeyEvents(pageId, window.KEYS.T, function () {
                console.log('快捷键');
                modal.open();
                _self.tipsView.render();
            });
        }

    });

    return memberView;
});