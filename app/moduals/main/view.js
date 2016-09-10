/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/main/model',
    '../../../../moduals/main/collection',
    '../../../../moduals/salesman/view',
    'text!../../../../moduals/main/posinfotpl.html',
    'text!../../../../moduals/main/tpl.html',
], function (BaseView, HomeModel, HomeCollection, SalesmanView, posinfotpl, tpl) {

    var mainView = BaseView.extend({

        id: "mainView",

        el: '.views',

        template: tpl,

        totalamount: 0,

        itemamount: 0,

        discountamount: 0,

        template_posinfo:posinfotpl,

        salesmanView:null,

        events: {

        },

        pageInit: function () {
            pageId = window.PAGE_ID.MAIN;
            console.log(pageId);
            var user = storage.get(system_config.LOGIN_USER_KEY);
            this.model = new HomeModel();
            this.requestModel = new HomeModel();
            this.model.set({
                name:user.user_name,
                pos: '收款机(2341)',
                totalamount: this.totalamount,
                itemamount: this.itemamount,
                discountamount: this.discountamount
            });
            if (this.salesmanView) {
                this.salesmanView.remove();
            } else {
                this.salesmanView = new SalesmanView();
            }
            this.initTemplates();
        },

        initPlugins: function () {
            $('input[name = main]').focus();
            this.renderPosInfo();
        },

        initTemplates: function () {
            this.template_posinfo = _.template(this.template_posinfo);
            //this.template_cart = _.template(this.template_cart);
            //this.template_shopitem = _.template(this.template_shopitem);
        },

        renderPosInfo: function () {
            this.$el.find('.for-posinfo').html(this.template_posinfo(this.model.toJSON()));
            return this;
        },

        bindKeys: function () {
            var _self = this;
            console.log('bindkeys main');
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Enter, function () {
                console.log('主页');
            });
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.M, function () {
                console.log('main m');
                router.navigate('member',{trigger:true});
            });
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.S, function () {
                _self.showModal(window.PAGE_ID.SALESMAN,_self.salesmanView);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = salesman_id]').focus();
                });
            });
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Esc,function () {
                toastr.info('退出');
            });
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.B,function () {
                router.navigate('billing',{trigger:true});
            });
        }

    });

    return mainView;
});