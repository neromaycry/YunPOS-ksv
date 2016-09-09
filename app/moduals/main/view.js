/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    'text!../../../../moduals/main/tpl.html',
], function (BaseView, tpl) {

    var mainView = BaseView.extend({

        id: "mainView",

        el: '.views',

        template: tpl,

        events: {

        },

        pageInit: function () {
            pageId = window.PAGE_ID.MAIN;
            console.log(pageId);
        },

        initPlugins: function () {

        },

        bindKeys: function () {
            this.bindKeyEvents(pageId, window.KEYS.Enter, function () {
                console.log('主页');
            });
            this.bindKeyEvents(pageId, window.KEYS.M, function () {
                router.navigate('member',{trigger:true});
            });
            this.bindKeyEvents(pageId, window.KEYS.S, function () {
                router.navigate('salesman',{trigger:true});
            });
        }

    });

    return mainView;
});