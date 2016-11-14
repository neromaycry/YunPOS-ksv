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

        input: 'input[name = logout_username]',

        events:{
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            //'click input[name = logout_username]':'focusInputUser',
            //'click input[name = logout_passwd]':'focusInputPasswd',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked'
        },

        modalInitPage: function () {
            this.model = new LogoutModel();
            $('.modal').on('shown.bs.modal', function () {
                $('input[name = logout_passwd]').focus();
            });
        },

        doLogout: function () {
            var _self = this;
            //var username = $('input[name = logout_username]').val();
            var username = storage.get(system_config.LOGIN_USER_KEY, 'user_id');
            var password = $('input[name = logout_passwd]').val();
            //if (username == '') {
            //    toastr.warning('请输入用户名');
            //    return;
            //}
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

        onCancelClicked: function () {
            this.hideModal(window.PAGE_ID.MAIN);
        },

        onOKClicked: function () {
            //var isUserFocused = $('input[name = logout_username]').is(':focus');
            //if (isUserFocused) {
            //    $('input[name = logout_passwd]').focus();
            //} else {
            //    this.doLogout();
            //}
            this.doLogout();
        },

        onNumClicked: function (e) {
            var value = $(e.currentTarget).data('num');
            var str = $(this.input).val();
            str += value;
            $(this.input).val(str);
        },

        onBackspaceClicked: function (e) {
            var str = $(this.input).val();
            str = str.substring(0, str.length-1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.LOGOUT, window.KEYS.Esc, function () {
                _self.hideModal(window.PAGE_ID.MAIN);
                $('input[name = main]').focus();
            });

            this.bindModalKeyEvents(window.PAGE_ID.LOGOUT, window.KEYS.Enter, function() {
                //var isUserFocused = $('input[name = logout_username]').is(':focus');
                //if (isUserFocused) {
                //    $('input[name = logout_passwd]').focus();
                //} else {
                //    _self.doLogout();
                //}
                _self.doLogout();
            });

            //this.bindModalKeyEvents(window.PAGE_ID.LOGOUT, window.KEYS.Up, function () {
            //    var isUserFocused = $('input[name = logout_username]').is(':focus');
            //    if (isUserFocused) {
            //        $('input[name = logout_passwd]').focus();
            //    } else {
            //        $('input[name = logout_username]').focus();
            //    }
            //});
            //
            //this.bindModalKeyEvents(window.PAGE_ID.LOGOUT, window.KEYS.Down, function () {
            //    var isUserFocused = $('input[name = logout_username]').is(':focus');
            //    if (isUserFocused) {
            //        $('input[name = logout_passwd]').focus();
            //    } else {
            //        $('input[name = logout_username]').focus();
            //    }
            //});
        },

        focusInputUser: function () {
            this.input = 'input[name = logout_username]';
        },

        focusInputPasswd: function () {
            this.input = 'input[name = logout_passwd]';
        }

    });

    return logoutModalView;
});