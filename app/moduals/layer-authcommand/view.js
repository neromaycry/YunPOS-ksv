/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-authcommand/model',
    'text!../../moduals/layer-authcommand/tpl.html',
], function (BaseLayerView, LayerAuthCommandMode, tpl) {

    var layerAuthCommandView = BaseLayerView.extend({

        id: "layerAuthCommandView",

        template: tpl,

        input: 'input[name = authcommand_user]',

        events: {
            'click .cancel': 'onCancelClicked',
            'click .ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked',
            'click input[name = authcommand_user]': 'focusInputUser',
            'click input[name = authcommand]': 'focusInputPasswd',
        },

        LayerInitPage: function () {
            var _self = this;
            this.model = new LayerAuthCommandMode();
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_AUTHCOMMAND, KEYS.Enter, function () {
                var isUserFocused = $('input[name = authcommand_user]').is(':focus');
                if (isUserFocused) {
                    $('input[name = authcommand]').focus();
                    _self.input = 'input[name = authcommand]';
                } else {
                    _self.onOKClicked();
                }
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_AUTHCOMMAND, KEYS.Up, function () {
                var isUserFocused = $('input[name = authcommand_user]').is(':focus');
                if (isUserFocused) {
                    $('input[name = authcommand]').focus();
                    _self.input = 'input[name = authcommand]';
                } else {
                    $('input[name = authcommand_user]').focus();
                    _self.input = 'input[name = authcommand_user]';
                }
            });
            this.bindLayerKeyEvents(PAGE_ID.LAYER_AUTHCOMMAND, KEYS.Down, function () {
                var isUserFocused = $('input[name = authcommand_user]').is(':focus');
                if (isUserFocused) {
                    $('input[name = authcommand]').focus();
                    _self.input = 'input[name = authcommand]';
                } else {
                    $('input[name = authcommand_user]').focus();
                    _self.input = 'input[name = authcommand_user]';
                }
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_AUTHCOMMAND, KEYS.Esc, function () {
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
            var authUser = $('input[name = authcommand_user]').val();
            var authcommand = $('input[name = authcommand]').val();
            if (authUser == '') {
                layer.msg('请输入用户名', optLayerWarning);
                return;
            }
            if (authcommand == '') {
                layer.msg('请输入口令', optLayerWarning);
                return;
            }
            var data = {
                user_id: authUser,
                user_password: $.md5(authcommand),
                accredit_type: this.attrs.accredit_type
            };
            var accredit_type = this.attrs.accredit_type;
            if (accredit_type == '01' || accredit_type == '02') {
                console.log(this.attrs.discount_rate);
                data['discount'] = this.attrs.discount_rate;
            }
            this.model.authAccess(data, function (resp) {
                if (resp.status == '00') {
                    console.log(resp);
                    if (_self.attrs.is_navigate) {
                        _self.confirmCloseLayer(_self.attrs.navigate_page);
                    } else {
                        _self.confirmCloseLayer(_self.attrs.pageid);
                    }
                    _self.attrs.callback();
                } else {
                    layer.msg(resp.msg, optLayerError);
                }
            });
        },

        focusInputUser: function () {
            this.input = 'input[name = authcommand_user]';
        },

        focusInputPasswd: function () {
            this.input = 'input[name = authcommand]';
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
                    break;
                case window.PAGE_ID.RETURN_FORCE:
                    this.closeLayer(PAGE_ID.RETURN_FORCE);
                    break;
                case window.PAGE_ID.CHECKING:
                    this.closeLayer(PAGE_ID.CHECKING);
                    break;
            }
        },

    });

    return layerAuthCommandView;
});