/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    'text!../../../../moduals/login/tpl.html',
], function (BaseView, tpl) {

    var loginView = BaseView.extend({

        id: "loginView",

        el: '.views',

        template: tpl,

        events: {

        },

        pageInit: function () {

        },

    });

    return loginView;
});