/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/login/model',
    '../../../../moduals/login/collection',
    '../../../../moduals/layer-confirm/view',
    '../../../../moduals/layer-gateway/view',
    'text!../../../../moduals/login/clientlogintpl.html',
    'text!../../../../moduals/login/tpl.html',
], function (BaseView, LoginModel, LoginCollection, LayerConfirmView, LayerGatewayView, clientlogintpl, tpl) {

    var loginView = BaseView.extend({

        id: "loginView",

        el: '.views',

        template: tpl,

        template_clientlogin: clientlogintpl,

        clientScreen: null,

        input: 'input[name = username]',

        events: {
            //'click #btn_login':'doLogin',
            'click .btn-doinit': 'doInitialize',
            'click .btn-numpad': 'onNumpadClicked',
            'click .ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked',
            'click input[name = username]': 'focusInputUser',
            'click input[name = password]': 'focusInputPasswd',
            'click .doinit':'onInitClicked',
            //'click .login-reconnecthw':'onReconnectHardwareClicked',
            'click .power-off': 'onPowerOffClicked',
            //'click .lock': 'lockScreen',
            'click .setting': 'onSettingClicked',
            //'click .bankcheckin': 'checkIn'
        },

        pageInit: function () {
            var _self = this;
            pageId = window.PAGE_ID.LOGIN;
            storage.remove(system_config.GATHER_KEY);
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
            //this.checkPosLimit();
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

        //checkPosLimit: function () {
        //    if (window.storage.isSet(system_config.SETTING_DATA_KEY, system_config.INIT_DATA_KEY, system_config.POS_LIMIT)) {
        //        var pos_limit = window.storage.get(system_config.SETTING_DATA_KEY, system_config.INIT_DATA_KEY, system_config.POS_LIMIT).toString();
        //        console.log(pos_limit);
        //        window.auth_discount = pos_limit.charAt(0); //折扣控制
        //        window.auth_report = pos_limit.charAt(1);  //报表控制
        //        window.auth_store = pos_limit.charAt(2);  //百货控制
        //        window.auth_receipt = pos_limit.charAt(3);  //打印小票
        //        window.auth_return = pos_limit.charAt(4);  //退货控制
        //        window.auth_delete = pos_limit.charAt(5);  //删除控制
        //        window.auth_quling = pos_limit.charAt(6);  //去零控制
        //        window.auth_cashdrawer = pos_limit.charAt(7);  //打开钱箱
        //        window.auth_reprint = pos_limit.charAt(8);  //复制小票
        //        window.auth_manualvip = pos_limit.charAt(9);  //手输vip控制
        //        window.auth_ecardswipe = pos_limit.charAt(10);  //一卡通刷卡输入口令
        //    } else {
        //        window.layer.msg('未获取POS机权限，请初始化获取', optLayerWarning);
        //    }
        //},

        iniSettngs: function () {
            var attrs = {
                pageid: pageId,
                content: '确定初始化？',
                is_navigate: false,
                callback: function () {
                    storage.removeAll();
                    window.location.reload();
                }
            };
            this.openConfirmLayer(PAGE_ID.LAYER_CONFIRM, pageId, LayerConfirmView, attrs, {area: '300px'});
        },

        onNumpadClicked: function () {
            var isDisplay = $('.numpad').css('display') == 'none';
            if (isDisplay) {
                $('.numpad').css('display', 'block');
                $('.btn-numpad').text('关闭小键盘');
            } else {
                $('.numpad').css('display', 'none');
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
            str = str.substring(0, str.length - 1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

        onPowerOffClicked: function () {
            //var confirmView = new ConfirmView({
            //    pageid: window.PAGE_ID.LOGIN, //当前打开confirm模态框的页面id
            //    callback: function () { //点击确认键的回调
            //        wsClient.send(DIRECTIVES.ShutDown);
            //    },
            //    content:'确定关机？' //confirm模态框的提示内容
            //});
            //this.showModal(window.PAGE_ID.CONFIRM, confirmView);
            var _self = this;
            var attrs = {
                pageid: pageId,
                content: '确定关机？',
                is_navigate: false,
                callback: function () {
                    _self.sendWebSocketDirective([DIRECTIVES.ShutDown], [''], wsClient);
                }
            };
            this.openConfirmLayer(PAGE_ID.LAYER_CONFIRM, pageId, LayerConfirmView, attrs, {area: '300px'});
        },

        focusInputUser: function () {
            this.input = 'input[name = username]';
        },

        focusInputPasswd: function () {
            this.input = 'input[name = password]';
        },

        onInitClicked: function () {
            this.iniSettngs();
        },

        //onReconnectHardwareClicked: function () {
        //    wsClient.close();
        //    window.location.reload();
        //},

        doLogin: function () {
            var _self = this;
            var username = $('input[name = username]').val();
            var password = $('input[name = password]').val();
            if (username == '') {
                //toastr.warning('请输入用户名');
                layer.msg('请输入用户名', optLayerWarning);
                return;
            }
            if (password == '') {
                //toastr.warning('请输入密码');
                layer.msg('请输入密码', optLayerWarning);
                return;
            }
            var data = {};
            data['user_id'] = username;
            data['user_password'] = $.md5(password);
            data['accredit_type'] = '00';
            this.model.login(data, function (response) {
                //成功回调
                if (!$.isEmptyObject(response)) {
                    if (response.status == "00") {
                        storage.set(window.system_config.LOGIN_USER_KEY, response);
                        storage.set(window.system_config.LOGIN_USER_KEY, 'manager_id', '*');
                        storage.set(window.system_config.TOKEN_KEY, response["token"]);
                        router.navigate("main", {
                            trigger: true,
                            replace: true
                        });
                        isFromLogin = true;
                        //toastr.success('登录成功');
                    } else {
                        //toastr.error(response.msg);
                        layer.msg(response.msg, optLayerError)
                    }
                } else {
                    //toastr.error(response.msg);
                    layer.msg(response.msg, optLayerError)
                }
            }, function (jqXHR, textStatus, errorThrown) {
                //失败回调
                console.log(textStatus);
                console.log(errorThrown);
                //var gatewayView = new GatewayView();
                //_self.showModal(window.PAGE_ID.MODAL_GATEWAY, gatewayView);
                _self.openLayer(PAGE_ID.LAYER_GATEWAY, pageId, '设置服务器地址', LayerGatewayView, null, {area: '400px'});
            });
            var loginDate = new Date();
            if (storage.isSet(system_config.LOGIN_DATE)) {
                var lastLoginDate = storage.get(system_config.LOGIN_DATE);
                if (loginDate != lastLoginDate) {
                    storage.remove(system_config.RESTORDER_KEY);
                    storage.set(system_config.RESTORDER_NUM, '00');
                }
            } else {
                storage.set(system_config.RESTORDER_NUM, '00');
            }
            storage.set(system_config.LOGIN_DATE, loginDate.getDate());
        },

        getGatherDetail: function () {
            var _self = this;
            var data = {};
            data['modify_date'] = '19700101000000';
            this.requestModel.requestGatherDetail(data, function (resp) {
                if (!$.isEmptyObject(resp)) {
                    if (resp.status == '00') {
                        storage.set(system_config.GATHER_KEY, resp.gather_detail);
                        toastr.success('支付方式列表更新成功');
                    } else {
                        //toastr.error(resp.msg);
                        layer.msg(resp.msg, optLayerError);
                    }
                } else {
                    layer.msg('系统错误，请联系管理员', optLayerWarning);
                }
            }, function (jqXHR, textStatus, errorThrown) {
                //失败回调
                console.log(textStatus);
                console.log(errorThrown);
                //var gatewayView = new GatewayView();
                //_self.showModal(window.PAGE_ID.MODAL_GATEWAY, gatewayView);
                _self.openLayer(PAGE_ID.LAYER_GATEWAY, pageId, '设置服务器地址', LayerGatewayView, null, {area: '400px'});
            });
        },

        onSettingClicked: function () {
            storage.set(system_config.LAST_PAGE, pageId);
            router.navigate('setting', {trigger: true});
        },

        //checkIn: function () {
        //    //toastr.info('签到');
        //    layer.msg('签到', optLayerSuccess);
        //    this.sendWebSocketDirective([DIRECTIVES.Bank_signin], [''], wsClient);
        //},

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
            this.bindKeyEvents(window.PAGE_ID.LOGIN, window.KEYS.I, function () {
                _self.iniSettngs();
            });

            this.bindKeyEvents(window.PAGE_ID.LOGIN, window.KEYS.Q, function () {
                _self.onSettingClicked();
            });
            //this.bindKeyEvents(window.PAGE_ID.LOGIN, window.KEYS.W, function () {
            //    _self.checkIn();
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
            //this.bindKeyEvents(window.PAGE_ID.LOGIN, window.KEYS.F4, function () {
            //    _self.lockScreen();
            //});
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
            this.setSettingKeys();
        },

        setMainKeys: function () {
            var effects = ['退出登录', '确定', '结算', '删除商品', '取消交易', '向上选择', '向下选择',
                '单品优惠', '单品折扣', '原单退货', '锁屏', '开钱箱', '挂单', '解挂' , '会员登录',
                '提大额', '收银对账', '营业员登录', '修改数量', '整单优惠','整单折扣','单品退货', '打印','银行业务',
                '会员登录切换会员卡登录', '会员登录切换手机号登录'];
            var keys = ['ESC', 'ENTER', 'Space', 'D', 'C', '↑', '↓' ,'F1','F2', 'F3', 'F4', 'F5','F6',
                'F7', 'F8', 'F9', 'F10', 'F11' ,'F12','Y','U','F', 'H', 'V', 'X', 'P'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Space, window.KEYS.D,
                window.KEYS.C, window.KEYS.Up, window.KEYS.Down, window.KEYS.F1, window.KEYS.F2,
                window.KEYS.F3, window.KEYS.F4, window.KEYS.F5, window.KEYS.F6, window.KEYS.F7,
                window.KEYS.F8, window.KEYS.F9, window.KEYS.F10, window.KEYS.F11, window.KEYS.F12,
                window.KEYS.Y,window.KEYS.U, window.KEYS.F,window.KEYS.H, window.KEYS.V, window.KEYS.X,
                window.KEYS.P];
            var mainKeys = [];
            for (var i = 0; i < effects.length; i++) {
                var effect = effects[i];
                var key = keys[i];
                var keyCode = keyCodes[i];
                var mainKey = {effect: effect, key: key, keyCode: keyCode};
                mainKeys.push(mainKey);
            }
            storage.set(system_config.SETTING_DATA_KEY, system_config.SHORTCUT_KEY, 'MAIN_PAGE', mainKeys);
        },

        setMemberKeys: function () {
            var effects = ['返回', '确定', '方向左', '方向右', '磁条卡', '手机号'];
            var keys = ['ESC', 'ENTER', '←', '→', 'X', 'P'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Left, window.KEYS.Right, window.KEYS.X, window.KEYS.P];
            var memberKeys = [];
            for (var i = 0; i < effects.length; i++) {
                var effect = effects[i];
                var key = keys[i];
                var keyCode = keyCodes[i];
                var memberKey = {effect: effect, key: key, keyCode: keyCode};
                memberKeys.push(memberKey);
            }
            storage.set(system_config.SETTING_DATA_KEY, system_config.SHORTCUT_KEY, 'MEMBER_PAGE', memberKeys);
        },

        setRestOrderKeys: function () {
            var effects = ['返回', '确定', '方向上', '方向下', '切换到挂单编号', '切换到挂单商品信息'];
            var keys = ['ESC', 'ENTER', '↑', '↓', '←', '→'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Up, window.KEYS.Down, window.KEYS.Left, window.KEYS.Right];
            var restOrderKeys = [];
            for (var i = 0; i < effects.length; i++) {
                var effect = effects[i];
                var key = keys[i];
                var keyCode = keyCodes[i];
                var restOrderKey = {effect: effect, key: key, keyCode: keyCode};
                restOrderKeys.push(restOrderKey);
            }
            storage.set(system_config.SETTING_DATA_KEY, system_config.SHORTCUT_KEY, 'RESTORDER_PAGE', restOrderKeys);
        },

        setReturnForceKeys: function () {
            var effects = ['返回', '确定', '结算', '删除商品', '取消退货', '向上选择', '向下选择',
                '单品优惠', '单品折扣', '修改数量'];
            var keys = ['ESC', 'ENTER', 'Space', 'D', 'C', '↑', '↓', 'F1', 'F2', 'F12'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Space, window.KEYS.D,
                window.KEYS.C, window.KEYS.Up, window.KEYS.Down, window.KEYS.F1, window.KEYS.F2, window.KEYS.F12];
            var returnForceKeys = [];
            for (var i = 0; i < effects.length; i++) {
                var effect = effects[i];
                var key = keys[i];
                var keyCode = keyCodes[i];
                var returnForceKey = {effect: effect, key: key, keyCode: keyCode};
                returnForceKeys.push(returnForceKey);
            }
            storage.set(system_config.SETTING_DATA_KEY, system_config.SHORTCUT_KEY, 'RETURNFORCE_PAGE', returnForceKeys);
        },

        setReturnWholeKeys: function () {
            var effects = ['返回', '确定', '结算', '取消退货','向上选择', '向下选择',];
            var keys = ['ESC', 'ENTER', 'Space', 'C','↑', '↓'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Space, window.KEYS.B, window.KEYS.C, window.KEYS.Up,
                window.KEYS.Down];
            var returnWholeKeys = [];
            for (var i = 0; i < effects.length; i++) {
                var effect = effects[i];
                var key = keys[i];
                var keyCode = keyCodes[i];
                var returnWholeKey = {effect: effect, key: key, keyCode: keyCode};
                returnWholeKeys.push(returnWholeKey);
            }
            storage.set(system_config.SETTING_DATA_KEY, system_config.SHORTCUT_KEY, 'RETURNWHOLE_PAGE', returnWholeKeys);
        },

        setBillingKeys: function () {
            var effects = ['返回', '确定','结算', '删除已支付的方式', '清空支付方式列表', '向上选择', '向下选择',
                '支票类支付', '礼券类支付', '银行卡POS支付', '第三方支付', '一卡通支付', '快捷支付','银行业务',
                 '一卡通切换会员卡登录', '一卡通切换手机号登录'];
            var keys = ['ESC', 'ENTER', 'Space', 'D', 'C', '↑', '↓', 'S', 'B', 'P', 'Q', 'O', 'E','V',
            'X','P'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Space, window.KEYS.D, window.KEYS.C,
                window.KEYS.Up, window.KEYS.Down, window.KEYS.S, window.KEYS.B, window.KEYS.P, window.KEYS.Q,
                window.KEYS.O, window.KEYS.E, window.KEYS.V, window.KEYS.X, window.KEYS.P];
            var billingKeys = [];
            for (var i = 0; i < effects.length; i++) {
                var effect = effects[i];
                var key = keys[i];
                var keyCode = keyCodes[i];
                var billingKey = {effect: effect, key: key, keyCode: keyCode};
                billingKeys.push(billingKey);
                storage.set(system_config.SETTING_DATA_KEY, system_config.SHORTCUT_KEY, 'BILLING_PAGE', billingKeys);
            }
        },

        setBillingReturnKeys: function () {
            var effects = ['返回', '确定','结算', '删除已支付的方式', '清空支付方式列表', '向上选择', '向下选择',
                '支票类支付', '礼券类支付', '银行卡POS支付', '第三方支付', '一卡通支付', '快捷支付', '一卡通切换会员卡登录',
                '一卡通切换手机号登录'];
            var keys = ['ESC', 'ENTER', 'Space', 'D', 'C', '↑', '↓', 'S', 'B', 'P', 'Q', 'O', 'E','X','P'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Space, window.KEYS.D, window.KEYS.C,
                window.KEYS.Up, window.KEYS.Down, window.KEYS.S, window.KEYS.B, window.KEYS.P, window.KEYS.Q,
                window.KEYS.O, window.KEYS.E,window.KEYS.X, window.KEYS.P];
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
                '切换收银员日结报表', '切换收款机报表'];
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
            var effects = ['返回', '确定', '向上选择', '向下选择', '打印'];
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
        },

        setSettingKeys: function () {
            var effects = ['返回', '确定', '修改服务器地址'];
            var keys = ['ESC', 'ENTER', 'Q'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Q];
            var printKeys = [];
            for (var i = 0; i < effects.length; i++) {
                var effect = effects[i];
                var key = keys[i];
                var keyCode = keyCodes[i];
                var printKey = {effect: effect, key: key, keyCode: keyCode};
                printKeys.push(printKey);
                storage.set(system_config.SETTING_DATA_KEY, system_config.SHORTCUT_KEY, 'SETTING_PAGE', printKeys);
            }
        }

    });

    return loginView;
});