/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    'text!../../../../moduals/restorder/tpl.html',
], function (BaseView, tpl) {

    var restorderView = BaseView.extend({

        id: "restorderView",

        el: '.views',

        template: tpl,

        events: {

        },

        pageInit: function () {
            pageId = window.PAGE_ID.RESTORDER;

        },

        initPlugins: function () {

        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(pageId, window.KEYS.Esc, function () {
                router.navigate('main',{trigger:true});
            });
            this.bindKeyEvents(pageId, window.KEYS.T, function () {
                _self.showModal(window.PAGE_ID.TIP_MEMBER,this.tipsView);
            });
        }

    });

    return restorderView;
});