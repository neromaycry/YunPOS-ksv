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


    });

    return mainView;
});