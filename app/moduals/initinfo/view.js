/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/initinfo/model',
    '../../../../moduals/initinfo/collection',
    'text!../../../../moduals/initinfo/tpl.html'
], function (BaseView, InitModel, InitCollection, tpl) {

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
            this.request.init(data,function(resp) {
                if (resp.status == '00') {
                    _self.model.set({
                        posid:resp.pos_id,//pos机号
                        merchantno:resp.merchant_no,//商户号
                        shopid:resp.shop_id,//门店号
                        merchantname:resp.merchant_name
                    });
                    _self.renderModel();
                } else {
                    toastr.warning(resp.msg);
                }
            });
            this.setMainKeys();
            this.setMemberKeys();
            this.setRestOrderKeys();
            this.setBillingKeys();
            this.setBillingReturnKeys();
            this.setReturnForceKeys();
            this.setReturnWholeKeys();
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
        },

        setMainKeys: function () {
            var effects = ['退出登录', '确定', '会员页面', '挂单', '解挂',
                 '营业员登录', '结算', '清空购物车', '删除商品', '修改数量',
                 '单品优惠', '向上选择', '向下选择', '强制退货页面', '整单退货页面'];
            var keys = ['ESC','ENTER','M','G','J',
                'S','B','C','D','N',
                'Y','↑','↓','F','W'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.M, window.KEYS.G, window.KEYS.J,
                window.KEYS.S, window.KEYS.B, window.KEYS.C, window.KEYS.D, window.KEYS.N,
                window.KEYS.Y, window.KEYS.Up, window.KEYS.Down, window.KEYS.F, window.KEYS.W];
            var mainKeys = [];
            for (var i = 0;i<effects.length;i++) {
                var effect = effects[i];
                var key = keys[i];
                var keyCode = keyCodes[i];
                var mainKey = { effect:effect, key:key, keyCode:keyCode };
                mainKeys.push(mainKey);
            }
            storage.set(system_config.SETTING_DATA_KEY,system_config.SHORTCUT_KEY,'MAIN_PAGE',mainKeys);
        },

        setMemberKeys: function () {
            var effects = ['返回', '确定', '方向左', '方向右'];
            var keys = ['ESC', 'ENTER', '←', '→'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Left, window.KEYS.Right];
            var memberKeys = [];
            for (var i = 0;i<effects.length;i++) {
                var effect = effects[i];
                var key = keys[i];
                var keyCode = keyCodes[i];
                var memberKey = { effect:effect, key:key, keyCode:keyCode };
                memberKeys.push(memberKey);
            }
            storage.set(system_config.SETTING_DATA_KEY,system_config.SHORTCUT_KEY,'MEMBER_PAGE',memberKeys);
        },

        setRestOrderKeys: function () {
            var effects = ['返回', '确定', '方向上', '方向下'];
            var keys = ['ESC', 'ENTER', '↑', '↓'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Up, window.KEYS.Down];
            var restOrderKeys = [];
            for (var i = 0;i<effects.length;i++) {
                var effect = effects[i];
                var key = keys[i];
                var keyCode = keyCodes[i];
                var restOrderKey = { effect:effect, key:key, keyCode:keyCode };
                restOrderKeys.push(restOrderKey);
            }
            storage.set(system_config.SETTING_DATA_KEY,system_config.SHORTCUT_KEY,'RESTORDER_PAGE',restOrderKeys);
        },

        setReturnForceKeys: function () {

        },

        setReturnWholeKeys: function () {

        },

        setBillingKeys: function () {

        },

        setBillingReturnKeys: function () {

        }

    });

    return initInfoView;
});