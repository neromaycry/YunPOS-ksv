/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/login/model',
    '../../../../moduals/login/collection',
    '../../../../moduals/layer-confirm/view',
    '../../../../moduals/layer-gateway/view',
    '../../../../moduals/layer-settingauth/view',
    'text!../../../../moduals/login/clientlogintpl.html',
    'text!../../../../moduals/login/tpl.html',
], function (BaseView, LoginModel, LoginCollection, LayerConfirmView, LayerGatewayView, LayerSettingAuthView, clientlogintpl, tpl) {

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
            'click .doinit': 'onInitClicked',
            //'click .login-reconnecthw':'onReconnectHardwareClicked',
            'click .power-off': 'onPowerOffClicked',
            //'click .lock': 'lockScreen',
            'click .setting': 'onSettingClicked',
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
            //this.getGatherDetailLocally();
            this.getGatherDetail();
            this.getPosLimit();
            this.getPosConfig();
            this.handleEvents();
            storage.set(system_config.IS_KEYBOARD_PLUGGED, true);
            //storage.set(system_config.IS_CLIENT_SCREEN_SHOW, true);
            //storage.set(system_config.INTERFACE_TYPE, Interface_type.CCB_LANDI);
            this.template_clientlogin = _.template(this.template_clientlogin);
            //this.checkPosLimit();
        },

        initPlugins: function () {
            var _self = this;
            setTimeout(function () {
                $(_self.input).focus();
            }, 500);
            this.setKeys();
            this.renderClientDisplay(isPacked, isClientScreenShow);
        },

        handleEvents: function () {
            Backbone.off('getGatherDetail');
            Backbone.on('getGatherDetail', this.getGatherDetail, this);
        },

        renderClientDisplay: function (isPacked, isClientShow) {
            if (isPacked && isClientShow) {
                $(clientDom).find('.client-display').html(this.template_clientlogin());
                return this;
            }
        },

        iniSettngs: function () {
            var attrs = {
                pageid: pageId,
                content: '确定初始化？',
                is_navigate: false,
                callback: function () {
                    storage.removeAll();
                    router.navigate('setposkey', {trigger: true, replace: true});
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
                layer.msg('请输入用户名', optLayerWarning);
                return;
            }
            if (password == '') {
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
                    } else {
                        layer.msg(response.msg, optLayerError);
                    }
                } else {
                    layer.msg(response.msg, optLayerError);
                }
            }, function (jqXHR, textStatus, errorThrown) {
                //失败回调
                console.log(textStatus);
                console.log(errorThrown);
                _self.openLayer(PAGE_ID.LAYER_GATEWAY, pageId, '设置服务器地址', LayerGatewayView, {input: 'input[name = username]'}, {area: '400px'});
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
                        layer.msg('已更新支付方式配置', _.extend(optLayerSuccess, {offset: '80px'}));
                    } else {
                        layer.msg(resp.msg, optLayerError);
                    }
                } else {
                    layer.msg('系统错误，请联系管理员', optLayerWarning);
                }
            }, function (jqXHR, textStatus, errorThrown) {
                //失败回调
                console.log(textStatus);
                console.log(errorThrown);
                _self.openLayer(PAGE_ID.LAYER_GATEWAY, pageId, '设置服务器地址', LayerGatewayView, {
                    input: 'input[name = username]',
                    is_login: true
                }, {area: '500px'});
            });
        },

        getPosLimit: function () {
            var posKey = storage.get(system_config.SETTING_DATA_KEY, system_config.INIT_DATA_KEY, 'pos_key');
            this.model.requestPosLimit({poskey: posKey}, function (resp) {
                if (!$.isEmptyObject(resp)) {
                    if (resp.status === '00') {
                        var pos_limit = resp.pos_limit;
                        storage.set(system_config.SETTING_DATA_KEY, system_config.INIT_DATA_KEY, system_config.POS_LIMIT, pos_limit);
                        window.auth_discount = pos_limit.charAt(0); //折扣控制
                        window.auth_report = pos_limit.charAt(1);  //报表控制
                        window.auth_store = pos_limit.charAt(2);  //百货控制
                        window.auth_receipt = pos_limit.charAt(3);  //打印小票
                        window.auth_return = pos_limit.charAt(4);  //退货控制
                        window.auth_delete = pos_limit.charAt(5);  //删除控制
                        window.auth_quling = pos_limit.charAt(6);  //去零控制
                        window.auth_cashdrawer = pos_limit.charAt(7);  //打开钱箱
                        window.auth_reprint = pos_limit.charAt(8);  //复制小票
                        window.auth_manualvip = pos_limit.charAt(9);  //手输vip控制
                        window.auth_ecardswipe = pos_limit.charAt(10);  //一卡通刷卡输入口令
                    } else {
                        layer.msg(resp.msg, optLayerError);
                    }
                } else {
                    layer.msg('服务器错误，请联系管理员', optLayerError);
                }
            });
        },

        getPosConfig: function () {
            var _self = this;
            this.model.requestPosConfig({}, function (resp) {
                console.log(resp);
                if (!$.isEmptyObject(resp)) {
                        storage.set(system_config.POS_CONFIG, 'ad_url', resp.ad_url);
                        storage.set(system_config.POS_CONFIG, system_config.IS_CLIENT_SCREEN_SHOW, resp.is_client_screen);
                        storage.set(system_config.POS_CONFIG, 'bank_interface', resp.bank_interface);
                        storage.set(system_config.POS_CONFIG, 'screen_height', resp.screen_height);
                        storage.set(system_config.POS_CONFIG, 'screen_width', resp.screen_width);
                        storage.set(system_config.POS_CONFIG, system_config.XFB_URL, resp.xfb_url);
                } else {
                    layer.msg('服务器错误，请联系管理员', optLayerError);
                }
            });
        },

        onSettingClicked: function () {
            var attrs = {
                pageid: pageId,
                is_navigate: false,
                callback: function () {
                    storage.set(system_config.LAST_PAGE, pageId);
                    router.navigate('setting', {trigger: true});
                }
            };
            this.openLayer(PAGE_ID.LAYER_SETTINGAUTH, pageId, '设置验证', LayerSettingAuthView, attrs, {area: '300px'});
        },

        //doInitialize: function () {
        //    this.iniSettngs();
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
                '单品优惠', '单品折扣', '原单退货', '锁屏', '开钱箱', '挂单', '解挂', '会员登录',
                '提大额', '收银对账', '修改数量', '整单优惠', '整单折扣', '单品退货', '打印', '银行业务'];
            var keys = ['ESC', 'ENTER', 'Space', 'D', 'C', '↑', '↓', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6',
                'F7', 'F8', 'F9', 'F10', 'F12', 'Y', 'U', 'F', 'H', 'V'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Space, window.KEYS.D,
                window.KEYS.C, window.KEYS.Up, window.KEYS.Down, window.KEYS.F1, window.KEYS.F2,
                window.KEYS.F3, window.KEYS.F4, window.KEYS.F5, window.KEYS.F6, window.KEYS.F7,
                window.KEYS.F8, window.KEYS.F9, window.KEYS.F10, window.KEYS.F12,
                window.KEYS.Y, window.KEYS.U, window.KEYS.F, window.KEYS.H, window.KEYS.V];
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
            var effects = ['返回', '确定', '结算', '删除商品', '取消退货', '向上选择', '向下选择', '会员登录', '修改数量'];
            var keys = ['ESC', 'ENTER', 'Space', 'D', 'C', '↑', '↓', 'F8', 'F12'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Space, window.KEYS.B, window.KEYS.D, window.KEYS.C, window.KEYS.Up,
                window.KEYS.Down, window.KEYS.F8, window.KEYS.F12];
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
            var effects = ['返回', '确定', '结算', '删除已支付的方式', '向上选择', '向下选择',
                '支票类支付', '礼券类支付', '银行卡支付', '第三方支付', '一卡通支付', '快捷支付', '银行业务'];
            var keys = ['ESC', 'ENTER', 'Space', 'D',  '↑', '↓', 'S', 'B', 'P', 'Q', 'O', 'E', 'V'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Space, window.KEYS.D,
                window.KEYS.Up, window.KEYS.Down, window.KEYS.S, window.KEYS.B, window.KEYS.P, window.KEYS.Q,
                window.KEYS.O, window.KEYS.E, window.KEYS.V];
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
            var effects = ['返回', '确定', '结算', '删除已支付的方式', '向上选择', '向下选择',
                '支票类支付', '礼券类支付', '银行卡支付', '第三方支付', '一卡通支付', '快捷支付'];
            var keys = ['ESC', 'ENTER', 'Space', 'D',  '↑', '↓', 'S', 'B', 'P', 'Q', 'O', 'E'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Space, window.KEYS.D,
                window.KEYS.Up, window.KEYS.Down, window.KEYS.S, window.KEYS.B, window.KEYS.P, window.KEYS.Q,
                window.KEYS.O, window.KEYS.E];
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
                '收银员日结报表', '收款机报表', '打印', '缴费表'];
            var keys = ['ESC', 'ENTER', '↑', '↓', '←', '→','H', 'G'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Up, window.KEYS.Down,
                window.KEYS.Left, window.KEYS.Right, window.KEYS.H, window.KEYS.G];
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
        },

        getGatherDetailLocally: function () {
            var gatherDetail = [{
                "gather_kind": "05",
                "valid_flag": "1",
                "change_flag": "0",
                "gather_type": "00",
                "number_flag": "0",
                "gather_id": "30",
                "gather_name": "支付宝",
                "gather_flag": "1",
                "modify_date": "2016-11-29 09:57:36",
                "gather_ui": "04",
                "score_flag": "1",
                "visible_flag": "1"
            }, {
                "gather_kind": "05",
                "valid_flag": "1",
                "change_flag": "0",
                "gather_type": "00",
                "number_flag": "0",
                "gather_id": "31",
                "gather_name": "微信",
                "gather_flag": "1",
                "modify_date": "2016-11-29 21:55:01",
                "gather_ui": "05",
                "score_flag": "1",
                "visible_flag": "1"
            }, {
                "gather_kind": "00",
                "valid_flag": "1",
                "change_flag": "1",
                "gather_type": "00",
                "number_flag": "0",
                "gather_id": "00",
                "gather_name": "现金",
                "gather_flag": "1",
                "modify_date": "2016-11-29 23:16:44",
                "gather_ui": "00",
                "score_flag": "0",
                "visible_flag": "1"
            }, {
                "gather_kind": "00",
                "valid_flag": "1",
                "change_flag": "0",
                "gather_type": "03",
                "number_flag": "1",
                "gather_id": "03",
                "gather_name": "支付宝",
                "gather_flag": "0",
                "modify_date": "2016-11-29 23:15:28",
                "gather_ui": "04",
                "score_flag": "0",
                "visible_flag": "1"
            }, {
                "gather_kind": "00",
                "valid_flag": "1",
                "change_flag": "0",
                "gather_type": "00",
                "number_flag": "0",
                "gather_id": "04",
                "gather_name": "去零",
                "gather_flag": "1",
                "modify_date": "2016-11-29 23:16:28",
                "gather_ui": "00",
                "score_flag": "0",
                "visible_flag": "0"
            }, {
                "gather_kind": "00",
                "valid_flag": "1",
                "change_flag": "0",
                "gather_type": "02",
                "number_flag": "0",
                "gather_id": "10",
                "gather_name": "银行mis",
                "gather_flag": "1",
                "modify_date": "2016-11-29 23:17:08",
                "gather_ui": "06",
                "score_flag": "1",
                "visible_flag": "1"
            }, {
                "gather_kind": "00",
                "valid_flag": "1",
                "change_flag": "0",
                "gather_type": "02",
                "number_flag": "1",
                "gather_id": "11",
                "gather_name": "银行POS",
                "gather_flag": "1",
                "modify_date": "2016-11-29 23:17:38",
                "gather_ui": "01",
                "score_flag": "1",
                "visible_flag": "1"
            }, {
                "gather_kind": "01",
                "valid_flag": "1",
                "change_flag": "0",
                "gather_type": "00",
                "number_flag": "1",
                "gather_id": "20",
                "gather_name": "支票",
                "gather_flag": "1",
                "modify_date": "2016-11-29 23:19:06",
                "gather_ui": "00",
                "score_flag": "1",
                "visible_flag": "1"
            }];
            storage.set(system_config.GATHER_KEY, gatherDetail);
        }

    });

    return loginView;
});