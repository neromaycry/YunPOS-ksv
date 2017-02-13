/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-logout/model',
    'text!../../moduals/layer-logout/tpl.html',
], function (BaseLayerView, LayerLogoutModel, tpl) {

    var layerLogoutView = BaseLayerView.extend({

        id: "layerLogoutView",

        template: tpl,

        input: 'input[name = logout_passwd]',

        events: {
            'click .cancel': 'onCancelClicked',
            'click .btn-numpad': 'onNumpadClicked',
            'click .ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked',
        },

        LayerInitPage: function () {
            this.model = new LayerLogoutModel();
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
            this.doLogout();
        },

        onCancelClicked: function () {
            this.closeLayer(layerindex);
            $('input[name = main]').focus();
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

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_LOGOUT, KEYS.Enter, function () {
                _self.enter();
            });

            setTimeout(function () {
                _self.bindLayerKeyEvents(window.PAGE_ID.LAYER_LOGOUT, KEYS.Esc, function () {
                    _self.esc();
                });
            }, 500);
        },

        enter: function () {
            this.doLogout();
        },

        esc: function () {
            this.closeLayer(layerindex);
            $('input[name = main]').focus();
        },

        doLogout: function () {
            var _self = this;
            //var username = $('input[name = logout_username]').val();
            var username = storage.get(system_config.LOGIN_USER_KEY, 'user_id');
            var password = $(this.input).val();
            //if (username == '') {
            //    return;
            //}
            if (password == '') {
                layer.msg('请输入密码', optLayerWarning);
                return;
            }
            var data = {
                user_id: username,
                user_password: $.md5(password),
                accredit_type: '00'
            };
            this.model.logout(data, function (response) {
                if (!$.isEmptyObject(response)) {
                    if (response.status == "00") {
                        _self.closeLayer(layerindex);
                        storage.remove(system_config.VIP_KEY);
                        storage.remove(system_config.SALE_PAGE_KEY);
                        router.navigate('login', {trigger: true});
                    } else {
                        layer.msg(response.msg, optLayerError);
                    }
                } else {
                    layer.msg(response.msg, optLayerError);
                }
            });
        },

    });

    return layerLogoutView;
});