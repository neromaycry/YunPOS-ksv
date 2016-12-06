/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-settingauth/model',
    'text!../../moduals/layer-settingauth/tpl.html',
], function (BaseLayerView, SettingAuthModel, tpl) {

    var settingAuthView = BaseLayerView.extend({

        id: "settingAuthView",

        template: tpl,

        input: 'input[name = setting_user]',

        events: {
            'click .cancel': 'onCancelClicked',
            'click .ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked',
            'click input[name = setting_user]': 'focusInputUser',
            'click input[name = settingauth]': 'focusInputPasswd',
        },

        LayerInitPage: function () {
            var _self = this;
            this.model = new SettingAuthModel();
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_SETTINGAUTH, KEYS.Enter, function () {
                var isUserFocused = $('input[name = setting_user]').is(':focus');
                if (isUserFocused) {
                    $('input[name = settingauth]').focus();
                    _self.input = 'input[name = settingauth]';
                } else {
                    _self.onOKClicked();
                }
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_SETTINGAUTH, KEYS.Up, function () {
                var isUserFocused = $('input[name = setting_user]').is(':focus');
                if (isUserFocused) {
                    $('input[name = authcommand]').focus();
                    _self.input = 'input[name = settingauth]';
                } else {
                    $('input[name = setting_user]').focus();
                    _self.input = 'input[name = setting_user]';
                }
            });
            this.bindLayerKeyEvents(PAGE_ID.LAYER_SETTINGAUTH, KEYS.Down, function () {
                var isUserFocused = $('input[name = setting_user]').is(':focus');
                if (isUserFocused) {
                    $('input[name = authcommand]').focus();
                    _self.input = 'input[name = settingauth]';
                } else {
                    $('input[name = setting_user]').focus();
                    _self.input = 'input[name = setting_user]';
                }
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_SETTINGAUTH, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
        },

        onCancelClicked: function () {
            if (this.attrs.is_navigate) {
                this.confirmCloseLayer(this.attrs.navigate_page);
            } else {
                this.confirmCloseLayer(this.attrs.pageid);
            }
        },

        onNumClicked: function (e) {
            var value = $(e.currentTarget).data('num');
            var str = $(this.input).val();
            str += value;
            $(this.input).val(str);
        },

        onBackspaceClicked: function (e) {
            var str = $(this.input).val();
            str = str.substring(0, str.length - 1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

        onOKClicked: function () {
            var _self = this;
            var authUser = $('input[name = setting_user]').val();
            var authPasswd = $('input[name = settingauth]').val();
            if (authUser == '') {
                layer.msg('请输入管理员用户名', optLayerWarning);
                return;
            }
            if (authPasswd == '') {
                layer.msg('请输入管理员口令', optLayerWarning);
                return;
            }
            if (authUser == '111' && authPasswd == '111') {
                if (_self.attrs.is_navigate) {
                    _self.confirmCloseLayer(_self.attrs.navigate_page);
                } else {
                    _self.confirmCloseLayer(_self.attrs.pageid);
                }
                _self.attrs.callback();
            } else {
                layer.msg('管理员验证失败，请重新输入', optLayerError);
                this.input = 'input[name = setting_user]';
                $(this.input).focus();
                $('input[name = setting_user]').val('');
                $('input[name = settingauth]').val('')
            }
            //var data = {
            //    user_id: authUser,
            //    user_password: $.md5(authPasswd),
            //    accredit_type: this.attrs.accredit_type
            //};
            //var accredit_type = this.attrs.accredit_type;
            //if (accredit_type == '01' || accredit_type == '02' || accredit_type == '03') {
            //    console.log(this.attrs.discount_rate);
            //    data['discount'] = this.attrs.discount_rate;
            //}
            //this.model.authAccess(data, function (resp) {
            //    if (resp.status == '00') {
            //        console.log(resp);
            //        storage.set(system_config.LOGIN_USER_KEY, 'manager_id', authUser);
            //        if (_self.attrs.is_navigate) {
            //            _self.confirmCloseLayer(_self.attrs.navigate_page);
            //        } else {
            //            _self.confirmCloseLayer(_self.attrs.pageid);
            //        }
            //        _self.attrs.callback();
            //    } else {
            //        layer.msg(resp.msg, optLayerError);
            //    }
            //});
        },

        focusInputUser: function () {
            this.input = 'input[name = setting_user]';
        },

        focusInputPasswd: function () {
            this.input = 'input[name = settingauth]';
        },

        closeLayer: function (id) {
            pageId = id;
            layer.close(layerindex);
        },

        confirmCloseLayer: function (pageid) {
            switch (pageid) {
                case window.PAGE_ID.LOGIN:
                    this.closeLayer(PAGE_ID.LOGIN);
                    $('input[name = username]').focus();
                    break;
                case window.PAGE_ID.SETDNS:
                    this.closeLayer(PAGE_ID.SETDNS);
                    break;
                case window.PAGE_ID.MAIN:
                    this.closeLayer(PAGE_ID.MAIN);
                    $('input[name = main]').focus();
                    break;
                case window.PAGE_ID.MEMBER:
                    this.closeLayer(PAGE_ID.MEMBER);
                    break;
                case window.PAGE_ID.RESTORDER:
                    this.closeLayer(PAGE_ID.RESTORDER);
                    break;
                case window.PAGE_ID.RETURN_WHOLE:
                    this.closeLayer(PAGE_ID.RETURN_WHOLE);
                    break;
                case window.PAGE_ID.BILLING:
                    this.closeLayer(PAGE_ID.BILLING);
                    $('input[name = billing]').focus();
                    break;
                case window.PAGE_ID.BILLING_RETURN:
                    this.closeLayer(PAGE_ID.BILLING_RETURN);
                    $('input[name = billingrt]').focus();
                    break;
                case window.PAGE_ID.RETURN_FORCE:
                    this.closeLayer(PAGE_ID.RETURN_FORCE);
                    $('input[name = sku_id]').focus();
                    break;
                case window.PAGE_ID.CHECKING:
                    this.closeLayer(PAGE_ID.CHECKING);
                    break;
            }
        },

    });

    return settingAuthView;
});