/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/login/model',
    '../../../../moduals/login/collection',
    'text!../../../../moduals/login/tpl.html',
], function (BaseView, LoginModel, LoginCollection, tpl) {

    var loginView = BaseView.extend({

        id: "loginView",

        el: '.views',

        template: tpl,

        events: {
            'click #btn_login':'doLogin'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.LOGIN;
            storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,system_config.GATEWAY_KEY,'http://111.198.72.128:3000/v1');
            storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,system_config.POS_KEY,'1');
            this.setHotKeys();
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
        },

        initPlugins: function () {
            $('input[name = username]').focus();
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

        setHotKeys: function () {
            this.memberhotkeys = new LoginCollection();
            var memberkey1 = new LoginModel();
            var memberkey2 = new LoginModel();
            memberkey1.set({
                effect:'返回',
                key:'ESC',
                keyCode:window.KEYS.Esc
            });
            memberkey2.set({
                effect:'确定',
                key:'Enter',
                keyCode:window.KEYS.Enter
            });
            this.memberhotkeys.push(memberkey1);
            this.memberhotkeys.push(memberkey2);
            storage.set(system_config.SETTING_DATA_KEY,system_config.SHORTCUT_KEY,'MEMBER_PAGE',this.memberhotkeys);
        },

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
        }

    });

    return loginView;
});