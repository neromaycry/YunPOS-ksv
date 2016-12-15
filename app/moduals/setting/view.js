define([
    '../../../../js/common/BaseView',
    '../../../../moduals/layer-help/view',
    '../../../../moduals/layer-gateway/view',
    '../../../../moduals/setting/model',
    'text!../../../../moduals/setting/tpl.html',
], function (BaseView, LayerHelpView, LayerGatewayView, SettingModel, tpl) {

    var settingView = BaseView.extend({

        id: "settingView",

        el: '.views',

        template: tpl,

        events: {
            'click .help': 'onHelpClicked',
            'click .back-to-main': 'onBackClicked',
            'click #btn-gateway': 'onGatewayClicked',
        },

        pageInit: function () {
            pageId = window.PAGE_ID.SETTING;
            this.model = new SettingModel();
            this.setSettingKeys();
        },

        initPlugins: function () {
            $("form").submit(function (e) {
                e.preventDefault();
            });
            var gateway = storage.get(system_config.SETTING_DATA_KEY, system_config.INIT_DATA_KEY, 'gateway');
            $('input[name = gateway]').val(gateway);

        },

        initTemplates: function () {

        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.SETTING, window.KEYS.Esc, function () {
                _self.onBackClicked();
            });

            this.bindKeyEvents(window.PAGE_ID.SETTING, window.KEYS.Enter, function () {
                //TODO: 确定按键
            });

            this.bindKeyEvents(window.PAGE_ID.SETTING, window.KEYS.T, function () {
                _self.onHelpClicked();
            });

            this.bindKeyEvents(window.PAGE_ID.SETTING, window.KEYS.Q, function () {
                _self.onGatewayClicked();
            });
        },


        onHelpClicked: function () {
            var attrs = {
                page: 'SETTING_PAGE',
                pageid: pageId
            };
            this.openLayer(PAGE_ID.LAYER_HELP, pageId, '帮助', LayerHelpView, attrs, {area: '600px'});
        },

        onGatewayClicked: function () {
            var attrs = {
                setting_callback: function () {
                    var gateway = storage.get(system_config.SETTING_DATA_KEY, system_config.INIT_DATA_KEY, 'gateway');
                    $('input[name = gateway]').val(gateway);
                }
            };
            this.openLayer(PAGE_ID.LAYER_GATEWAY, pageId, '设置服务器地址', LayerGatewayView, attrs, {area: '500px'});
        },

        onBackClicked: function () {
            var lastpage = storage.get(system_config.LAST_PAGE);
            console.log(lastpage);
            switch (lastpage) {
                case PAGE_ID.LOGIN:
                    router.navigate('login', {trigger: true, replace: true});
                    break;
                case PAGE_ID.MAIN:
                    router.navigate('main', {trigger: true, replace: true});
                    break;
                case PAGE_ID.SETPOSKEY:
                    router.navigate('setposkey', {trigger: true, replace: true});
                    break;
            }
        },

        setSettingKeys: function () {
            var effects = ['返回', '确定', '修改服务器地址'];
            var keys = ['ESC', 'ENTER', 'Q'];
            var keyCodes = [window.KEYS.Esc, window.KEYS.Enter, window.KEYS.Q];
            var printKeys = [];
            for (var i = 0; i < effects.length; i++) {
                var effect = effects[i];
                var key = keys[i];
                var keyCode = keyCodes[i];
                var printKey = {effect: effect, key: key, keyCode: keyCode};
                printKeys.push(printKey);
                storage.set(system_config.SETTING_DATA_KEY, system_config.SHORTCUT_KEY, 'SETTING_PAGE', printKeys);
            }
        },

    });

    return settingView;
});