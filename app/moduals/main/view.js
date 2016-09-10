/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    'text!../../../../moduals/main/tpl.html',
    '../../../../moduals/salesman/view'
], function (BaseView,tpl,SaleManView) {

    var mainView = BaseView.extend({

        id: "mainView",

        el: '.views',

        template: tpl,

        events: {

        },

        pageInit: function () {

            this.tipsView = new SaleManView();
        },

        initPlugins: function () {
        },

        bindKeys: function () {
            var _self = this;
            pageId = window.PAGE_ID.MAIN;
            this.bindKeyEvents(pageId, window.KEYS.Enter, function () {
               if($('#search_item').val() == ''){
                   toastr.warning('商品编码不能为空');
               }else {
                   console.log('显示商品编码');
               }
            });
            this.bindKeyEvents(pageId, window.KEYS.M, function () {
                router.navigate('member',{trigger:true});
            });
            this.bindKeyEvents(pageId, window.KEYS.S, function () {
                modal.open();
                _self.tipsView.render();
            });
            this.bindKeyEvents(pageId, window.KEYS.C, function() {
                $('.list-item').hide();
                toastr.success('清空购物车成功');
            });
            this.bindKeyEvents(pageId, window.KEYS.G, function() {
                toastr.success('挂单成功');
            });
            this.bindKeyEvents(pageId, window.KEYS.J, function() {
                toastr.success('解挂成功');
            });
            this.bindKeyEvents(pageId, window.KEYS.B, function() {
                toastr.success('付款');
            });
            this.bindKeyEvents(pageId, window.KEYS.Up, function() {
                toastr.success('上');
            });
            this.bindKeyEvents(pageId, window.KEYS.Down, function() {
                toastr.success('下');
            });
            this.bindKeyEvents(pageId, window.KEYS.N, function() {
                toastr.success('修改数量');
            });
            this.bindKeyEvents(pageId, window.KEYS.NumPad0, function() {
                str = $('#search_item').val();
                str = str + '1';
                $('#ser')
            });
        }

    });

    return mainView;
});