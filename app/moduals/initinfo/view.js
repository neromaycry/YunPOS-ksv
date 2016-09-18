/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/initinfo/model',
    'text!../../../../moduals/initinfo/tpl.html'
], function (BaseView, InitModel, tpl) {

    var initInfoView = BaseView.extend({

        id: "initInfoView",

        el: '.views',

        template: tpl,

        events: {

        },

        pageInit: function () {
            pageId = window.PAGE_ID.INITINFO;
            this.model = new InitModel();
            this.request = new InitModel();
        },

        initPlugins: function () {
            var _self = this;
            var data = {};
            var poskey = storage.get(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,'poskey');
            data['poskey'] = poskey;
            this.request.init(data,function(resp){
                if(resp.status == '00'){
                    _self.model.set({
                        posid:resp.pos_id,//pos机号
                        merchantno:resp.merchant_no,//商户号
                        shopid:resp.shop_id,//门店号
                        merchantname:resp.merchant_name
                    });
                    _self.renderModel();
                }else {
                    //window.toast.show(resp.msg,'警告');
                    toastr.warning(resp.msg);
                    //f7app.alert(resp.msg,'警告');
                }
            });
        },

        renderModel: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        bindKeys: function () {
            this.bindKeyEvents(window.PAGE_ID.INITINFO,window.KEYS.Enter, function () {
                console.log('enter');
                storage.set(system_config.IS_FIRST_KEY, true);
                if (storage.isSet(system_config.IS_FIRST_KEY)) {
                    router.navigate('login', {trigger:true});
                }
            });

            this.bindKeyEvents(window.PAGE_ID.INITINFO, window.KEYS.Esc, function () {
                console.log('esc');
                router.navigate('setposkey', {trigger:true});
            });
        }


    });

    return initInfoView;
});