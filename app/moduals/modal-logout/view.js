/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-logout/model',
    'text!../../moduals/modal-logout/tpl.html',
], function (BaseModalView, LogoutModel, tpl) {

    var logoutModalView = BaseModalView.extend({

        id: "logoutModalView",

        template: tpl,

        modalInitPage: function () {
            this.model = new LogoutModel();
        },

        doLogout: function () {
            var _self = this;
            var username = $('input[name = logout_username]').val();
            var password = $('input[name = logout_passwd]').val();
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
            this.model.logout(data,function (response) {
                if (!$.isEmptyObject(response)) {
                    if (response.status == "00") {
                        router.navigate('login', {trigger:true});
                        _self.hideModal(window.PAGE_ID.LOGIN);
                    } else {
                        toastr.error(response.msg);
                    }
                } else {
                    toastr.error(response.msg);
                }
            });

        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.LOGOUT, window.KEYS.Esc, function () {
                _self.hideModal(window.PAGE_ID.MAIN);
                $('input[name = main]').focus();
            });

            this.bindModalKeyEvents(window.PAGE_ID.LOGOUT, window.KEYS.Enter, function() {
                var isUserFocused = $('input[name = logout_username]').is(':focus');
                if (isUserFocused) {
                    $('input[name = logout_passwd]').focus();
                } else {
                    _self.doLogout();
                }
            });

            this.bindModalKeyEvents(window.PAGE_ID.LOGOUT, window.KEYS.Up, function () {
                var isUserFocused = $('input[name = logout_username]').is(':focus');
                if (isUserFocused) {
                    $('input[name = logout_passwd]').focus();
                } else {
                    $('input[name = logout_username]').focus();
                }
            });

            this.bindModalKeyEvents(window.PAGE_ID.LOGOUT, window.KEYS.Down, function () {
                var isUserFocused = $('input[name = logout_username]').is(':focus');
                if (isUserFocused) {
                    $('input[name = logout_passwd]').focus();
                } else {
                    $('input[name = logout_username]').focus();
                }
            });
        },


    });

    return logoutModalView;
});