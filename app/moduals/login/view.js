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
            'click input[name = password]':'focusInputPasswd'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.LOGIN;
            storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,system_config.GATEWAY_KEY,'http://111.198.72.128:3000/v1');
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
        },

        iniSettngs: function () {
            var confirmView = new ConfirmView({
                pageid: window.PAGE_ID.LOGIN,
                is_navigate:true,
                navigate_page:window.PAGE_ID.SETDNS,
                callback: function () {
                    storage.remove(system_config.SETTING_DATA_KEY);
                    storage.remove(system_config.IS_FIRST_KEY);
                    router.navigate("setdns",{trigger:true,replace:true});
                },
                content:'确定初始化吗？'
            });
            this.showModal(window.PAGE_ID.CONFIRM, confirmView);
        },

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
                window.location.reload();
            });
        }

    });

    return loginView;
});