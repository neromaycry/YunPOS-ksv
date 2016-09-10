/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/main/model',
    '../../../../moduals/main/collection',
    'text!../../../../moduals/main/posinfotpl.html',
    'text!../../../../moduals/main/tpl.html',
], function (BaseView, HomeModel, HomeCollection, posinfotpl, tpl) {

    var mainView = BaseView.extend({

        id: "mainView",

        el: '.views',

        template: tpl,

        totalamount: 0,

        itemamount: 0,

        discountamount: 0,

        template_posinfo:posinfotpl,

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
            this.bindKeyEvents(pageId, window.KEYS.Enter, function () {
                console.log('主页');
            });
            this.bindKeyEvents(pageId, window.KEYS.M, function () {
                router.navigate('member',{trigger:true});
            });
            this.bindKeyEvents(pageId, window.KEYS.S, function () {
                router.navigate('salesman',{trigger:true});
            });
            this.bindKeyEvents(pageId, window.KEYS.Esc,function () {
                toastr.info('esc 主页');
            });
        }

    });

    return mainView;
});