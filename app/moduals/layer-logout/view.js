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

        LayerInitPage: function () {
            this.model = new LayerLogoutModel();
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
            //    toastr.warning('请输入用户名');
            //    return;
            //}
            if (password == '') {
                //toastr.warning('请输入密码');
                layer.msg('请输入密码', optLayerWarning);
                return;
            }
            var data = {
                user_id: username,
                user_password: $.md5(password),
                accredit_type: '00'
            };
            this.model.logout(data,function (response) {
                if (!$.isEmptyObject(response)) {
                    if (response.status == "00") {
                        _self.closeLayer(layerindex);
                        router.navigate('login', {trigger:true});
                    } else {
                        //toastr.error(response.msg);
                        layer.msg(response.msg, optLayerError);
                    }
                } else {
                    //toastr.error(response.msg);
                    layer.msg(response.msg, optLayerError);
                }
            });
        },

    });

    return layerLogoutView;
});