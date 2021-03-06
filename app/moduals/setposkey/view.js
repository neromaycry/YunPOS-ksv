/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/setposkey/model',
    '../../../../moduals/layer-gateway/view',
    '../../../../moduals/layer-settingauth/view',
    'text!../../../../moduals/setposkey/tpl.html'
], function (BaseView, SetPoskeyModel, LayerGatewayView, LayerSettingAuthView, tpl) {

    var setPoskeyView = BaseView.extend({

        id: "setPoskeyView",

        el: '.views',

        template: tpl,

        input: 'input[name = poskey]',

        events: {
            'click .btn-numpad': 'onNumpadClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked',
            //'click .poskey-pre':'onPreClicked',
            'click .poskey-next': 'onNextClicked',
            'click .setting': 'onSettingClicked'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.SETPOSKEY;
            if (!storage.isSet(system_config.SETTING_DATA_KEY, system_config.INIT_DATA_KEY, system_config.GATEWAY_KEY)) {
                storage.set(system_config.SETTING_DATA_KEY, system_config.INIT_DATA_KEY, system_config.GATEWAY_KEY, 'http://127.0.0.1:3000/v1');
                //storage.set(system_config.SETTING_DATA_KEY, system_config.INIT_DATA_KEY, system_config.GATEWAY_KEY, 'http://111.198.72.128:3000/v1');
            }
        },

        initPlugins: function () {
            $(this.input).focus();
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.SETPOSKEY, window.KEYS.Enter, function () {
                _self.onNextClicked();
            });
            this.bindKeyEvents(window.PAGE_ID.SETPOSKEY, window.KEYS.Q, function () {
                _self.onSettingClicked();
            });
            //this.bindKeyEvents(window.PAGE_ID.SETPOSKEY, window.KEYS.Esc, function () {
            //    router.navigate('setdns', {trigger:true});
            //});
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

        //onPreClicked: function () {
        //    router.navigate('setdns', {trigger:true});
        //},

        onNextClicked: function () {
            var _self = this;
            var value = $('input[name = poskey]').val();
            if (value == '') {
                layer.msg('请输入有效的授权key', optLayerError);
            } else {
                var data = {};
                data['poskey'] = value;
                this.request = new SetPoskeyModel();
                this.request.init(data, function (resp) {
                    if (!$.isEmptyObject(resp)) {
                        if (resp.status == '00') {
                            console.log(resp);
                            router.navigate('initinfo', {trigger: true});
                            //storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY, 'poskey', value);
                            storage.set(system_config.SETTING_DATA_KEY, system_config.INIT_DATA_KEY, system_config.POS_KEY, value);
                            //storage.set(system_config.SETTING_DATA_KEY, system_config.INIT_DATA_KEY, system_config.POS_LIMIT, resp.pos_limit);
                        } else {
                            layer.msg(resp.msg, optLayerError);
                        }
                    } else {
                        layer.msg('服务器错误，请联系管理员', optLayerError);
                    }
                }, function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus);
                    console.log(errorThrown);
                    _self.openLayer(PAGE_ID.LAYER_GATEWAY, pageId, '设置服务器地址', LayerGatewayView, {input: _self.input}, {area: '500px'});
                });
            }
        },

        onSettingClicked: function () {
            var attrs = {
                pageid: pageId,
                is_navigate: false,
                callback: function () {
                    storage.set(system_config.LAST_PAGE, PAGE_ID.SETPOSKEY);
                    router.navigate('setting', {trigger: true});
                }
            };
            this.openLayer(PAGE_ID.LAYER_SETTINGAUTH, pageId, '设置验证', LayerSettingAuthView, attrs, {area: '300px'});
        }

    });

    return setPoskeyView;
});