/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/login/model',
    '../../../../moduals/login/collection',
    '../../../../moduals/modal-confirm/view',
    'text!../../../../moduals/login/tpl.html',
], function (BaseView, LoginModel, LoginCollection, ConfirmView, tpl) {

    var loginView = BaseView.extend({

        id: "loginView",

        el: '.views',

        template: tpl,

        input:'input[name = username]',

        events: {
            //'click #btn_login':'doLogin',
            'click .btn-doinit':'doInitialize',
            'click .btn-numpad':'onNumpadClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
            'click input[name = username]':'focusInputUser',
            'click input[name = password]':'focusInputPasswd',
            //'click .login-init':'onInitClicked',
            'click .login-reconnecthw':'onReconnectHardwareClicked'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.LOGIN;
            storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,system_config.GATEWAY_KEY,'http://111.198.72.128:3000/v1');
            //storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,system_config.GATEWAY_KEY,'http://192.168.31.197:3000/v1');
            storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,system_config.POS_KEY,'1');


            this.requestModel = new LoginModel();
            this.model = new LoginModel();
            var data = {};
            data['modify_date'] = '19700101000000';
            this.requestModel.getGatherDetail(data, function (resp) {
                if(resp.status == '00') {
                    storage.set(system_config.GATHER_KEY,resp.gather_detail);
                    toastr.success('支付方式列表更新成功');
                } else {
                    toastr.error(resp.msg);
                }
            });
            storage.set(system_config.IS_KEYBOARD_PLUGGED, true);
        },

        initPlugins: function () {
            $('input[name = username]').focus();
            this.setKeys();
        },

        //iniSettngs: function () {
        //    var confirmView = new ConfirmView({
        //        pageid: window.PAGE_ID.LOGIN,
        //        is_navigate:true,
        //        navigate_page:window.PAGE_ID.SETDNS,
        //        callback: function () {
        //            storage.remove(system_config.SETTING_DATA_KEY);
        //            storage.remove(system_config.IS_FIRST_KEY);
        //            router.navigate("setdns",{trigger:true,replace:true});
        //        },
        //        content:'确定初始化吗？'
        //    });
        //    this.showModal(window.PAGE_ID.CONFIRM, confirmView);
        //},

        onNumpadClicked: function () {
            var isDisplay = $('.numpad').css('display') == 'none';
            if (isDisplay) {
                $('.numpad').css('display','block');
                $('.btn-numpad').text('关闭小键盘');
            } else {
                $('.numpad').css('display','none');
                $('.btn-numpad').text('打开小键盘');
            }
        },

        onOKClicked: function () {
            this.doLogin();
        },

        onNumClicked: function (e) {
            var value = $(e.currentTarget).data('num');
            var str = $(this.input).val();
            str += value;
            $(this.input).val(str);
        },

        onBackspaceClicked: function () {
            var str = $(this.input).val();
            str = str.substring(0, str.length-1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

        focusInputUser: function () {
            this.input = 'input[name = username]';
        },

        focusInputPasswd: function () {
            this.input = 'input[name = password]';
        },

        //onInitClicked: function () {
        //    this.iniSettngs();
        //},

        onReconnectHardwareClicked: function () {
            wsClient.close();
            window.location.reload();
        },

        doLogin: function () {
            var username = $('input[name = username]').val();
            var password = $('input[name = password]').val();
            if (username == '') {
                toastr.warning('请输入用户名');
                return;
            }
            if (password == '') {
                toastr.warning('请输入密码');
                return;
            }
            var data = {};
            data['user_id'] = username;
            data['user_password'] = $.md5(password);
            data['accredit_type'] = '00';
            this.model.login(data,function (response) {
                if (!$.isEmptyObject(response)) {
                    if (response.status == "00") {
                        storage.set(window.system_config.LOGIN_USER_KEY, response);
                        storage.set(window.system_config.TOKEN_KEY, response["token"]);
                        router.navigate("main", {
                            trigger: true,
                            replace: true
                        });
                        toastr.success('登录成功');
                    } else {
                        toastr.error(response.msg);
                    }
                } else {
                    toastr.error(response.msg);
                }
            });
            var loginDate = new Date();
            if (storage.isSet(system_config.LOGIN_DATE)) {
                var lastLoginDate = storage.get(system_config.LOGIN_DATE);
                if (loginDate != lastLoginDate) {
                    storage.remove(system_config.RESTORDER_KEY);
                    storage.set(system_config.RESTORDER_NUM,'00');
                }
            } else {
                storage.set(system_config.RESTORDER_NUM,'00');
            }
            storage.set(system_config.LOGIN_DATE, loginDate.getDate());
        },

        doInitialize: function () {
            this.iniSettngs();
        },

        //encodeUTF8: function (str) {
        //    var newStr = '';
        //    for (var i = 0; i < str.length; i++) {
        //        newStr += '\\u' + str.charCodeAt(i).toString(16);
        //    }
        //    return newStr;
        //},

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.LOGIN, window.KEYS.Enter, function () {
                var isUserFocused = $('input[name = username]').is(':focus');
                if (isUserFocused) {
                    $('input[name = password]').focus();
                } else {
                    _self.doLogin();
                }
            });
            this.bindKeyEvents(window.PAGE_ID.LOGIN, window.KEYS.Up, function () {
                var isUserFocused = $('input[name = username]').is(':focus');
                if (isUserFocused) {
                    $('input[name = password]').focus();
                } else {
                    $('input[name = username]').focus();
                }
            });
            this.bindKeyEvents(window.PAGE_ID.LOGIN, window.KEYS.Down, function () {
                var isUserFocused = $('input[name = username]').is(':focus');
                if (isUserFocused) {
                    $('input[name = password]').focus();
                } else {
                    $('input[name = username]').focus();
                }
            });
            this.bindKeyEvents(window.PAGE_ID.LOGIN, window.KEYS.I, function () {
                _self.iniSettngs();
            });
            this.bindKeyEvents(window.PAGE_ID.LOGIN, window.KEYS.L, function () {
                wsClient.close();
                window.location.reload();
            });

        },

        setKeys: function () {
            this.setMainKeys();
            this.setMemberKeys();
            this.setRestOrderKeys();
            this.setBillingKeys();
            this.setBillingReturnKeys();
            this.setReturnForceKeys();
            this.setReturnWholeKeys();
            this.setCheckingKeys();
        },

        setMainKeys: function () {
            var effects = ['退出登录', '确定', '会员页面', '挂单', '解挂',
                '营业员登录', '结算', '清空购物车', '删除商品', '修改数量',
                '单品优惠', '折让','向上选择', '向下选择', '强制退货页面', '整单退货页面','收银对账'];
            var keys = ['ESC','ENTER','M','G','J',
                'S','B','C','D','N',
                'Y','U','↑','↓','F','W','A'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.M, window.KEYS.G, window.KEYS.J,
                window.KEYS.S, window.KEYS.B, window.KEYS.C, window.KEYS.D, window.KEYS.N,
                window.KEYS.Y, window.KEYS.U, window.KEYS.Up, window.KEYS.Down, window.KEYS.F, window.KEYS.W, window.KEYS.A];
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
            var effects = ['返回', '确定', '方向上', '方向下','切换到挂单编号','切换到挂单商品信息'];
            var keys = ['ESC', 'ENTER', '↑', '↓','←','→'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Up, window.KEYS.Down,window.KEYS.Left,window.KEYS.Right];
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
            var effects = ['返回', '确定', '结算', '取消退货', '删除商品','修改数量','单品优惠','方向上', '方向下'];
            var keys = ['ESC', 'ENTER', 'B','C','D','N','Y','↑', '↓'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter,window.KEYS.B,window.KEYS.C,
                window.KEYS.D,window.KEYS.N,window.KEYS.Y,window.KEYS.Up, window.KEYS.Down];
            var returnForceKeys = [];
            for (var i = 0;i<effects.length;i++) {
                var effect = effects[i];
                var key = keys[i];
                var keyCode = keyCodes[i];
                var returnForceKey = { effect:effect, key:key, keyCode:keyCode };
                returnForceKeys.push(returnForceKey);
            }
            storage.set(system_config.SETTING_DATA_KEY,system_config.SHORTCUT_KEY,'RETURNFORCE_PAGE',returnForceKeys);
        },

        setReturnWholeKeys: function () {
            var effects = ['返回', '确定', '结算', '取消退货'];
            var keys = ['ESC', 'ENTER', 'B', 'C'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.B, window.KEYS.C];
            var returnWholeKeys = [];
            for (var i = 0;i<effects.length;i++) {
                var effect = effects[i];
                var key = keys[i];
                var keyCode = keyCodes[i];
                var returnWholeKey = { effect:effect, key:key, keyCode:keyCode };
                returnWholeKeys.push(returnWholeKey);
            }
            storage.set(system_config.SETTING_DATA_KEY,system_config.SHORTCUT_KEY,'RETURNWHOLE_PAGE',returnWholeKeys);
        },

        setBillingKeys: function () {
            var effects = ['返回', '确定', '删除已支付的方式','结算', '向上选择', '向下选择',
                '支票类支付', '礼券类支付', '银行POS支付', '第三方支付', '整单优惠',
                '取消整单优惠', '一卡通支付','清空支付方式列表','快捷支付'];
            var keys = ['ESC','ENTER','D','B','↑','↓',
                'S','A','P','Q','Y',
                'E','O','C','F'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.D,window.KEYS.B, window.KEYS.Up, window.KEYS.Down,
                window.KEYS.S, window.KEYS.A, window.KEYS.P, window.KEYS.Q, window.KEYS.Y,
                window.KEYS.E, window.KEYS.O, window.KEYS.C,window.KEYS.F];
            var billingKeys = [];
            for (var i = 0;i<effects.length;i++) {
                var effect = effects[i];
                var key = keys[i];
                var keyCode = keyCodes[i];
                var billingKey = { effect:effect, key:key, keyCode:keyCode };
                billingKeys.push(billingKey);
                storage.set(system_config.SETTING_DATA_KEY,system_config.SHORTCUT_KEY,'BILLING_PAGE',billingKeys);
            }
        },

        setBillingReturnKeys: function () {
            var effects = ['返回', '确定', '删除已支付的方式', '结算', '向上选择', '向下选择',
                '支票类支付', '礼券类支付', '银行POS支付', '第三方支付', '一卡通支付','清空支付方式列表','快捷支付'];
            var keys = ['ESC', 'ENTER', 'D', 'B', '↑', '↓',
                'S', 'A', 'P', 'Q', 'O','C','F'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.D, window.KEYS.B, window.KEYS.Up, window.KEYS.Down,
                window.KEYS.S, window.KEYS.A, window.KEYS.P, window.KEYS.Q, window.KEYS.O,window.KEYS.C,window.KEYS.F];
            var billingreturnKeys = [];
            for (var i = 0; i < effects.length; i++) {
                var effect = effects[i];
                var key = keys[i];
                var keyCode = keyCodes[i];
                var billingreturnKey = {effect: effect, key: key, keyCode: keyCode};
                billingreturnKeys.push(billingreturnKey);
                storage.set(system_config.SETTING_DATA_KEY, system_config.SHORTCUT_KEY, 'BILLING_RETURN_PAGE', billingreturnKeys);
            }
        },

        setCheckingKeys: function () {
            var effects = ['返回', '确定', '向上选择', '向下选择',
                '切换收银员报表', '切换收银员日结报表'];
            var keys = ['ESC', 'ENTER','↑', '↓',
                '←', '→'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Up, window.KEYS.Down,
                window.KEYS.Left, window.KEYS.Right];
            var checkingKeys = [];
            for (var i = 0; i < effects.length; i++) {
                var effect = effects[i];
                var key = keys[i];
                var keyCode = keyCodes[i];
                var checkingKey = {effect: effect, key: key, keyCode: keyCode};
                checkingKeys.push(checkingKey);
                storage.set(system_config.SETTING_DATA_KEY, system_config.SHORTCUT_KEY, 'CHECKING_PAGE', checkingKeys);
            }
        },

    });

    return loginView;
});