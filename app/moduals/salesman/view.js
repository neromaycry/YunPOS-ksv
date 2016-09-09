/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    'text!../../../../moduals/salesman/tpl.html',
], function (BaseView, tpl) {

    var salesmanView = BaseView.extend({

        id: "salesmanView",

        el: '.views',

        template: tpl,

        events: {

        },

        pageInit: function () {
            pageId = window.PAGE_ID.SALESMAN;
        },

        initPlugins: function () {

        },

        bindKeys: function () {
            this.bindKeyEvents(pageId,window.KEYS.Esc, function () {
                router.navigate('main',{trigger:true});
            });
        }

    });

    return salesmanView;
});