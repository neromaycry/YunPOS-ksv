/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-login/model',
    '../../moduals/modal-login/collection',
    'text!../../moduals/modal-login/tpl.html',
], function (BaseModalView,SecondloginModel,SecondloginCollection, tpl) {

    var secondloginView = BaseModalView.extend({

        id: "secondloginView",

        template: tpl,

        modalInitPage: function () {
            this.model = new SecondloginModel();
            $('.modal').on('shown.bs.modal', function () {
                $('input[name = secondlogin_user]').focus();
            });
        },

        doSecondLogin: function () {
            var _self = this;
            var username = $('input[name = secondlogin_user]').val();
            var password = $('input[name = secondlogin_passwd]').val();
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
            this.model.secondlogin(data,function (resp) {
                if (!$.isEmptyObject(resp)) {
                    if (resp.status == "00") {
                        _self.confirmHideModal(_self.attrs.pageid);
                        _self.attrs.callback();
                    } else {
                        toastr.error(resp.msg);
                    }
                } else {
                    toastr.error(resp.msg);
                }
            });

        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.SECONDLOGIN, window.KEYS.Esc, function () {
                _self.confirmHideModal(_self.attrs.pageid);
            });
            this.bindModalKeyEvents(window.PAGE_ID.SECONDLOGIN, window.KEYS.Enter, function () {
                var isUserFocused = $('input[name = secondlogin_user]').is(':focus');
                if (isUserFocused) {
                    $('input[name = secondlogin_passwd]').focus();
                } else {
                    _self.doSecondLogin();
                }
            });
            this.bindModalKeyEvents(window.PAGE_ID.SECONDLOGIN, window.KEYS.Up, function () {
                var isUserFocused = $('input[name = secondlogin_user]').is(':focus');
                if (isUserFocused) {
                    $('input[name = secondlogin_passwd]').focus();
                } else {
                    $('input[name = secondlogin_user]').focus();
                }
            });

            this.bindModalKeyEvents(window.PAGE_ID.SECONDLOGIN, window.KEYS.Down, function () {
                var isUserFocused = $('input[name = secondlogin_user]').is(':focus');
                if (isUserFocused) {
                    $('input[name = secondlogin_passwd]').focus();
                } else {
                    $('input[name = secondlogin_user]').focus();
                }
            });
        },

        confirmHideModal:function(pageid) {
            switch (pageid) {
                case window.PAGE_ID.MAIN:
                    this.hideModal(window.PAGE_ID.MAIN);
                    break;
                case window.PAGE_ID.MEMBER:
                    this.hideModal(window.PAGE_ID.MEMBER);
                    break;
                case window.PAGE_ID.RESTORDER:
                    this.hideModal(window.PAGE_ID.RESTORDER);
                    break;
                case window.PAGE_ID.RETURN_WHOLE:
                    this.hideModal(window.PAGE_ID.RETURN_WHOLE);
                    break;
                case window.PAGE_ID.BILLING:
                    this.hideModal(window.PAGE_ID.BILLING);
                    break;
                case window.PAGE_ID.BILLING_RETURN:
                    this.hideModal(window.PAGE_ID.BILLING_RETURN);
                    break;
                case window.PAGE_ID.RETURN_FORCE:
                    this.hideModal(window.PAGE_ID.RETURN_FORCE);
                    break;
                case window.PAGE_ID.CHECKING:
                    this.hideModal(window.PAGE_ID.CHECKING);
                    break;
            }
        }

    });

    return secondloginView;
});