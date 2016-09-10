/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseView',
    'text!../../moduals/salesman/tpl.html',
], function (BaseView, tpl) {

    var salesmanView = BaseView.extend({

        id: "salesmanView",

        el: '.modal-container',

        template: tpl,

        events: {

        },

        pageInit: function () {
            pageId = window.PAGE_ID.SALESMAN;
        },

        initPlugins: function () {

        },

        bindKeys: function () {
            this.bindKeyEvents(pageId, window.KEYS.Esc , function () {
                var remodal = $('[data-remodal-id=modal]').remodal();
                remodal.close();
            });
            this.bindKeyEvents(pageId, window.KEYS.Enter , function () {
                toastr.success('营业员登陆成功');
                pageId = window.PAGE_ID.MAIN;
                var remodal = $('[data-remodal-id=modal]').remodal();
                remodal.close();
            });
        }

    });

    return salesmanView;
});