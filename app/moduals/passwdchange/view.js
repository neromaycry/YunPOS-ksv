/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/passwdchange/model',
    'text!../../../../moduals/passwdchange/tpl.html',
], function (BaseView, PasswdModel,tpl) {

    var memberView = BaseView.extend({

        id: "passwdChangeView",

        el: '.views',

        template: tpl,

        input: 'input[name = custid]',

        events: {

        },

        pageInit: function () {
            pageId = window.PAGE_ID.PASSWD_CHANGE;
            this.initTemplates();
            this.handleEvents();
        },


        handleEvents: function () {

        },

        initTemplates: function () {

        },

        bindKeys: function () {

        }

    });

    return memberView;
});