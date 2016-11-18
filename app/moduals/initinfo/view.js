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
            'click .init-done':'onInitDoneClicked'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.INITINFO;
            this.model = new InitModel();
            this.request = new InitModel();
        },

        initPlugins: function () {
            var _self = this;
            var data = {};
            var poskey = storage.get(system_config.SETTING_DATA_KEY, system_config.INIT_DATA_KEY, 'poskey');
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
            this.setCheckingKeys();
        },

        renderModel: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.INITINFO,window.KEYS.Enter, function () {
                //storage.set(system_config.IS_FIRST_KEY, true);
                //if (storage.isSet(system_config.IS_FIRST_KEY)) {
                //    router.navigate('login', {trigger:true});
                //}
                _self.onInitDoneClicked();
            });

            //this.bindKeyEvents(window.PAGE_ID.INITINFO, window.KEYS.Esc, function () {
            //    router.navigate('setposkey', {trigger:true});
            //});
        },

        //setMainKeys: function () {
        //    var effects = ['退出登录', '确定', '会员页面', '挂单', '解挂',
        //         '营业员登录', '结算', '清空购物车', '删除商品', '修改数量',
        //         '单品优惠', '向上选择', '向下选择', '强制退货页面', '整单退货页面','收银对账'];
        //    var keys = ['ESC','ENTER','M','G','J',
        //        'S','B','C','D','N',
        //        'Y','↑','↓','F','W','A'];
        //    var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.M, window.KEYS.G, window.KEYS.J,
        //        window.KEYS.S, window.KEYS.B, window.KEYS.C, window.KEYS.D, window.KEYS.N,
        //        window.KEYS.Y, window.KEYS.Up, window.KEYS.Down, window.KEYS.F, window.KEYS.W, window.KEYS.A];
        //    var mainKeys = [];
        //    for (var i = 0;i<effects.length;i++) {
        //        var effect = effects[i];
        //        var key = keys[i];
        //        var keyCode = keyCodes[i];
        //        var mainKey = { effect:effect, key:key, keyCode:keyCode };
        //        mainKeys.push(mainKey);
        //    }
        //    storage.set(system_config.SETTING_DATA_KEY,system_config.SHORTCUT_KEY,'MAIN_PAGE',mainKeys);
        //},
        //
        //setMemberKeys: function () {
        //    var effects = ['返回', '确定', '方向左', '方向右'];
        //    var keys = ['ESC', 'ENTER', '←', '→'];
        //    var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Left, window.KEYS.Right];
        //    var memberKeys = [];
        //    for (var i = 0;i<effects.length;i++) {
        //        var effect = effects[i];
        //        var key = keys[i];
        //        var keyCode = keyCodes[i];
        //        var memberKey = { effect:effect, key:key, keyCode:keyCode };
        //        memberKeys.push(memberKey);
        //    }
        //    storage.set(system_config.SETTING_DATA_KEY,system_config.SHORTCUT_KEY,'MEMBER_PAGE',memberKeys);
        //},
        //
        //setRestOrderKeys: function () {
        //    var effects = ['返回', '确定', '方向上', '方向下','切换到挂单编号','切换到挂单商品信息'];
        //    var keys = ['ESC', 'ENTER', '↑', '↓','←','→'];
        //    var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Up, window.KEYS.Down, window.KEYS.Left,window.KEYS.Right];
        //    var restOrderKeys = [];
        //    for (var i = 0;i<effects.length;i++) {
        //        var effect = effects[i];
        //        var key = keys[i];
        //        var keyCode = keyCodes[i];
        //        var restOrderKey = { effect:effect, key:key, keyCode:keyCode };
        //        restOrderKeys.push(restOrderKey);
        //    }
        //    storage.set(system_config.SETTING_DATA_KEY,system_config.SHORTCUT_KEY, 'RESTORDER_PAGE', restOrderKeys);
        //},
        //
        //setReturnForceKeys: function () {
        //    var effects = ['返回', '确定', '结算', '取消退货', '删除商品','修改数量','单品优惠','方向上', '方向下'];
        //    var keys = ['ESC', 'ENTER', 'B','C','D','N','Y','↑', '↓'];
        //    var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.B,window.KEYS.C,
        //        window.KEYS.D,window.KEYS.N, window.KEYS.Y, window.KEYS.Up, window.KEYS.Down];
        //    var returnForceKeys = [];
        //    for (var i = 0;i<effects.length;i++) {
        //        var effect = effects[i];
        //        var key = keys[i];
        //        var keyCode = keyCodes[i];
        //        var returnForceKey = { effect:effect, key:key, keyCode:keyCode };
        //        returnForceKeys.push(returnForceKey);
        //    }
        //    storage.set(system_config.SETTING_DATA_KEY,system_config.SHORTCUT_KEY, 'RETURNFORCE_PAGE', returnForceKeys);
        //},
        //
        //setReturnWholeKeys: function () {
        //    var effects = ['返回', '确定', '结算', '取消退货'];
        //    var keys = ['ESC', 'ENTER', 'B', 'C'];
        //    var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.B, window.KEYS.C];
        //    var returnWholeKeys = [];
        //    for (var i = 0;i<effects.length;i++) {
        //        var effect = effects[i];
        //        var key = keys[i];
        //        var keyCode = keyCodes[i];
        //        var returnWholeKey = { effect:effect, key:key, keyCode:keyCode };
        //        returnWholeKeys.push(returnWholeKey);
        //    }
        //    storage.set(system_config.SETTING_DATA_KEY,system_config.SHORTCUT_KEY, 'RETURNWHOLE_PAGE', returnWholeKeys);
        //},
        //
        //setBillingKeys: function () {
        //    var effects = ['返回', '确定', '删除已支付的方式','结算', '向上选择', '向下选择',
        //        '支票类支付', '礼券类支付', '银行POS支付', '第三方支付', '整单优惠',
        //        '取消整单优惠', '一卡通支付','清空支付方式列表','快捷支付'];
        //    var keys = ['ESC','ENTER','D','B','↑','↓',
        //        'S','A','P','Q','Y',
        //        'E','O','C','F'];
        //    var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.D,window.KEYS.B, window.KEYS.Up, window.KEYS.Down,
        //        window.KEYS.S, window.KEYS.A, window.KEYS.P, window.KEYS.Q, window.KEYS.Y,
        //        window.KEYS.E, window.KEYS.O, window.KEYS.C,window.KEYS.F];
        //    var billingKeys = [];
        //    for (var i = 0;i<effects.length;i++) {
        //        var effect = effects[i];
        //        var key = keys[i];
        //        var keyCode = keyCodes[i];
        //        var billingKey = { effect:effect, key:key, keyCode:keyCode };
        //        billingKeys.push(billingKey);
        //        storage.set(system_config.SETTING_DATA_KEY,system_config.SHORTCUT_KEY,'BILLING_PAGE',billingKeys);
        //    }
        //},
        //
        //setBillingReturnKeys: function () {
        //    var effects = ['返回', '确定', '删除已支付的方式', '结算', '向上选择', '向下选择',
        //        '支票/汇票支付', '礼券类支付', '银行POS支付', '第三方支付', '一卡通支付'];
        //    var keys = ['ESC', 'ENTER', 'D', 'B', '↑', '↓',
        //        'S', 'A', 'P', 'Q', 'O'];
        //    var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.D, window.KEYS.B, window.KEYS.Up, window.KEYS.Down,
        //        window.KEYS.S, window.KEYS.A, window.KEYS.P, window.KEYS.Q, window.KEYS.O];
        //    var billingreturnKeys = [];
        //    for (var i = 0; i < effects.length; i++) {
        //        var effect = effects[i];
        //        var key = keys[i];
        //        var keyCode = keyCodes[i];
        //        var billingreturnKey = {effect: effect, key: key, keyCode: keyCode};
        //        billingreturnKeys.push(billingreturnKey);
        //        storage.set(system_config.SETTING_DATA_KEY, system_config.SHORTCUT_KEY, 'BILLING_RETURN_PAGE', billingreturnKeys);
        //    }
        //},
        //
        //setCheckingKeys: function () {
        //    var effects = ['返回', '确定', '向上选择', '向下选择',
        //        '切换收银员报表', '切换收银员日结报表'];
        //    var keys = ['ESC', 'ENTER','↑', '↓',
        //        '←', '→'];
        //    var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Up, window.KEYS.Down,
        //        window.KEYS.Left, window.KEYS.Right];
        //    var checkingKeys = [];
        //    for (var i = 0; i < effects.length; i++) {
        //        var effect = effects[i];
        //        var key = keys[i];
        //        var keyCode = keyCodes[i];
        //        var checkingKey = {effect: effect, key: key, keyCode: keyCode};
        //        checkingKeys.push(checkingKey);
        //        storage.set(system_config.SETTING_DATA_KEY, system_config.SHORTCUT_KEY, 'CHECKING_PAGE', checkingKeys);
        //    }
        //},

        onInitDoneClicked: function () {
            storage.set(system_config.IS_FIRST_KEY, true);
            if (storage.isSet(system_config.IS_FIRST_KEY)) {
                router.navigate('login', {trigger:true});
                storage.set(system_config.POS_INFO_KEY, this.model.toJSON());
            }
        }

    });

    return initInfoView;
});