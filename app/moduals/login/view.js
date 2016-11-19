/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/login/model',
    '../../../../moduals/login/collection',
    '../../../../moduals/modal-confirm/view',
    '../../../../moduals/modal-gateway/view',
    'text!../../../../moduals/login/clientlogintpl.html',
    'text!../../../../moduals/login/tpl.html',
], function (BaseView, LoginModel, LoginCollection, ConfirmView, GatewayView, clientlogintpl, tpl) {

    var loginView = BaseView.extend({

        id: "loginView",

        el: '.views',

        template: tpl,

        template_clientlogin: clientlogintpl,

        clientScreen: null,

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
            'click .login-reconnecthw':'onReconnectHardwareClicked',
            'click .power-off':'onPowerOffClicked',
            'click .lock': 'lockScreen'
        },

        pageInit: function () {
            var _self = this;
            pageId = window.PAGE_ID.LOGIN;
            //if (!storage.isSet(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,system_config.GATEWAY_KEY)) {
            //    storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,system_config.GATEWAY_KEY,'http://111.198.72.128:3000/v1');
            //}
            //storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,system_config.GATEWAY_KEY,'http://192.168.31.249:3000/v1');
            //storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,system_config.POS_KEY,'1');
            this.requestModel = new LoginModel();
            this.model = new LoginModel();
            this.getGatherDetail();
            this.handleEvents();
            storage.set(system_config.IS_KEYBOARD_PLUGGED, true);
            storage.set(system_config.IS_CLIENT_SCREEN_SHOW, true);
            this.template_clientlogin = _.template(this.template_clientlogin);
        },

        initPlugins: function () {
            $(this.input).focus();
            this.setKeys();
            this.renderClientDisplay(isPacked);
            //$('.login-print').on('click', function () {
            //    console.log('print');
            //    window.wsClient.send('PRNT_ 打印sdfajsdklfjaldsjfadf');
            //});
        },

        handleEvents: function () {
            Backbone.off('getGatherDetail');
            Backbone.on('getGatherDetail', this.getGatherDetail, this);
        },

        renderClientDisplay: function (isPacked) {
            if (isPacked) {
                $(clientDom).find('.client-display').html(this.template_clientlogin());
                return this;
            }
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

        onPowerOffClicked: function () {
            var confirmView = new ConfirmView({
                pageid: window.PAGE_ID.LOGIN, //当前打开confirm模态框的页面id
                callback: function () { //点击确认键的回调
                    wsClient.send(DIRECTIVES.ShutDown);
                },
                content:'确定关机？' //confirm模态框的提示内容
            });
            this.showModal(window.PAGE_ID.CONFIRM, confirmView);
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
            var _self = this;
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
                //成功回调
                if (!$.isEmptyObject(response)) {
                    if (response.status == "00") {
                        storage.set(window.system_config.LOGIN_USER_KEY, response);
                        storage.set(window.system_config.TOKEN_KEY, response["token"]);
                        router.navigate("main", {
                            trigger: true,
                            replace: true
                        });
                        isFromLogin = true;
                        //toastr.success('登录成功');
                    } else {
                        toastr.error(response.msg);
                    }
                } else {
                    toastr.error(response.msg);
                }
            }, function(jqXHR, textStatus, errorThrown) {
                //失败回调
                console.log(textStatus);
                console.log(errorThrown);
                var gatewayView = new GatewayView();
                _self.showModal(window.PAGE_ID.MODAL_GATEWAY, gatewayView);
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

        getGatherDetail: function () {
            var _self = this;
            var data = {};
            data['modify_date'] = '19700101000000';
            this.requestModel.requestGatherDetail(data, function (resp) {
                if(resp.status == '00') {
                    storage.set(system_config.GATHER_KEY,resp.gather_detail);
                    toastr.success('支付方式列表更新成功');
                } else {
                    toastr.error(resp.msg);
                }
            }, function(jqXHR, textStatus, errorThrown) {
                //失败回调
                console.log(textStatus);
                console.log(errorThrown);
                var gatewayView = new GatewayView();
                _self.showModal(window.PAGE_ID.MODAL_GATEWAY, gatewayView);
            });
        },

        //doInitialize: function () {
        //    this.iniSettngs();
        //},

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
            //this.bindKeyEvents(window.PAGE_ID.LOGIN, window.KEYS.I, function () {
            //    _self.iniSettngs();
            //});
            //this.bindKeyEvents(window.PAGE_ID.LOGIN, window.KEYS.L, function () {
            //    var SOCKET_ADDR = 'ws://localhost:7110/';
            //    wsClient.close();
            //    wsClient = new WebSocket(SOCKET_ADDR);
            //    wsClient.onopen = function (e) {
            //        window.toastr.success('已与硬件建立连接');
            //    };
            //    wsClient.onmessage = function (e) {
            //        console.log(e);
            //    };
            //    wsClient.onclose = function (e) {
            //        window.toastr.warning('与硬件连接断开');
            //    };
            //    wsClient.onerror = function (e) {
            //        window.toastr.warning('与硬件连接出现问题，请检查硬件');
            //    };
            //});

            this.bindKeyEvents(window.PAGE_ID.LOGIN, window.KEYS.Esc, function () {
                _self.onPowerOffClicked();
            });
            this.bindKeyEvents(window.PAGE_ID.LOGIN, window.KEYS.F4, function () {
                _self.lockScreen();
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
            this.setPrintKeys();
        },

        setMainKeys: function () {
            var effects = ['退出登录', '确定', '会员页面','打印页面', '挂单', '解挂',
                '营业员登录', '结算', '清空购物车', '删除商品', '修改数量',
                '单品优惠', '折扣','向上选择', '向下选择', '强制退货页面', '整单退货页面','收银对账', '提大额'];
            var keys = ['ESC','ENTER','M','H','G','J',
                'S','Space','C','D','N',
                'Y','U','↑','↓','F','W','A', 'Q'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.M,window.KEYS.H, window.KEYS.G, window.KEYS.J,
                window.KEYS.S, window.KEYS.Space, window.KEYS.C, window.KEYS.D, window.KEYS.N,
                window.KEYS.Y, window.KEYS.U, window.KEYS.Up, window.KEYS.Down, window.KEYS.F, window.KEYS.W, window.KEYS.A,
                window.KEYS.Q];
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
            var effects = ['返回', '确定', '方向左', '方向右', '磁条卡', '手机号'];
            var keys = ['ESC', 'ENTER', '←', '→', 'X', 'P'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Left, window.KEYS.Right, window.KEYS.X, window.KEYS.P];
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
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Up, window.KEYS.Down, window.KEYS.Left, window.KEYS.Right];
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
            var effects = ['返回', '确定', '结算', '取消退货', '删除商品','修改数量','单品优惠','折扣','方向上', '方向下'];
            var keys = ['ESC', 'ENTER', 'Space','C','D','N','Y', 'U','↑', '↓',];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Space, window.KEYS.C,
                window.KEYS.D, window.KEYS.N, window.KEYS.Y, window.KEYS.U, window.KEYS.Up, window.KEYS.Down];
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
            var keys = ['ESC', 'ENTER', 'Space', 'C'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Space, window.KEYS.B, window.KEYS.C];
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
                '支票类支付', '礼券类支付', '银行POS支付', '第三方支付', '整单优惠','整单折扣',
                '一卡通支付','清空支付方式列表','快捷支付'];
            var keys = ['ESC', 'ENTER', 'D', 'Space', '↑', '↓',
                'S', 'A', 'P', 'Q', 'Y', 'U'
                ,'O', 'C', 'F'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.D, window.KEYS.Space, window.KEYS.Up, window.KEYS.Down,
                window.KEYS.S, window.KEYS.A, window.KEYS.P, window.KEYS.Q, window.KEYS.Y, window.KEYS.U,
                window.KEYS.O, window.KEYS.C, window.KEYS.F];
            var billingKeys = [];
            for (var i = 0;i<effects.length;i++) {
                var effect = effects[i];
                var key = keys[i];
                var keyCode = keyCodes[i];
                var billingKey = { effect:effect, key:key, keyCode:keyCode };
                billingKeys.push(billingKey);
                storage.set(system_config.SETTING_DATA_KEY, system_config.SHORTCUT_KEY,'BILLING_PAGE', billingKeys);
            }
        },

        setBillingReturnKeys: function () {
            var effects = ['返回', '确定', '删除已支付的方式', '结算', '向上选择', '向下选择',
                '支票类支付', '礼券类支付', '银行POS支付', '第三方支付', '一卡通支付','清空支付方式列表','快捷支付'];
            var keys = ['ESC', 'ENTER', 'D', 'Space', '↑', '↓',
                'S', 'A', 'P', 'Q', 'O', 'C', 'F'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.D, window.KEYS.Space, window.KEYS.Up, window.KEYS.Down,
                window.KEYS.S, window.KEYS.A, window.KEYS.P, window.KEYS.Q, window.KEYS.O, window.KEYS.C, window.KEYS.F];
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
            var keys = ['ESC', 'ENTER', '↑', '↓',
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

        setPrintKeys: function () {
            var effects = ['返回', '确定', '向上选择', '向下选择','打印'];
            var keys = ['ESC', 'ENTER', '↑', '↓', 'H'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Up, window.KEYS.Down, window.KEYS.H];
            var printKeys = [];
            for (var i = 0; i < effects.length; i++) {
                var effect = effects[i];
                var key = keys[i];
                var keyCode = keyCodes[i];
                var printKey = {effect: effect, key: key, keyCode: keyCode};
                printKeys.push(printKey);
                storage.set(system_config.SETTING_DATA_KEY, system_config.SHORTCUT_KEY, 'PRINT_PAGE', printKeys);
            }
        }

    });

    return loginView;
});