/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/setposkey/model',
    '../../../../moduals/modal-gateway/view',
    'text!../../../../moduals/setposkey/tpl.html'
], function (BaseView, SetPoskeyModel, GatewayView, tpl) {

    var setPoskeyView = BaseView.extend({

        id: "setPoskeyView",

        el: '.views',

        template: tpl,

        events: {
            //'click .poskey-pre':'onPreClicked',
            'click .poskey-next':'onNextClicked'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.SETPOSKEY;
            if (!storage.isSet(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,system_config.GATEWAY_KEY)) {
                storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,system_config.GATEWAY_KEY,'http://111.198.72.128:3000/v1');
            }
        },

        initPlugins: function () {
            $('input[name = poskey]').focus();
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.SETPOSKEY, window.KEYS.Enter, function () {
               _self.onNextClicked();
            });
            //this.bindKeyEvents(window.PAGE_ID.SETPOSKEY, window.KEYS.Esc, function () {
            //    router.navigate('setdns', {trigger:true});
            //});
        },

        //onPreClicked: function () {
        //    router.navigate('setdns', {trigger:true});
        //},

        onNextClicked: function () {
            var _self = this;
            var value =  $('input[name = poskey]').val();
            if (value == '') {
                toastr.warning('请输入有效的授权key');
            } else {
                var data = {};
                data['poskey'] = value;
                this.request = new SetPoskeyModel();
                this.request.init(data, function(resp) {
                    if(resp.status == '00') {
                        router.navigate('initinfo', { trigger: true });
                        //storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY, 'poskey', value);
                        storage.set(system_config.SETTING_DATA_KEY, system_config.INIT_DATA_KEY, system_config.POS_KEY, value);
                    } else {
                        toastr.error(resp.msg);
                    }
                }, function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus);
                    console.log(errorThrown);
                    var gatewayView = new GatewayView();
                    _self.showModal(window.PAGE_ID.MODAL_GATEWAY, gatewayView);
                });
            }
        }

    });

    return setPoskeyView;
});