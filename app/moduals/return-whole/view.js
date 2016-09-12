/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    'text!../../../../moduals/return-whole/tpl.html'
], function (BaseView, tpl) {

    var returnWholeView = BaseView.extend({

        id: "returnWholeView",

        el: '.views',

        template: tpl,

        totalamount: 0,

        itemamount: 0,

        discountamount: 0,

        i: 0,

        events: {

        },

        pageInit: function () {
            pageId = window.PAGE_ID.RETURN_WHOLE;

        },

        initPlugins: function () {

        },

        bindKeys: function () {
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.Esc,function () {
                router.navigate('main',{trigger:true});
            });
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.B,function () {
                isfromForce = false;
                router.navigate('billingreturn',{trigger:true});
            });
        }

    });

    return returnWholeView;
});