/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    'text!../../../../moduals/setdns/tpl.html'
], function (BaseView, tpl) {

    var setDNSView = BaseView.extend({

        id: "setDNSView",

        el: '.views',

        template: tpl,

        events: {
            'click .dns-next':'onNextClicked'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.SETDNS;

        },

        initPlugins: function () {
            $('input[name = dns]').focus();
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.SETDNS,window.KEYS.Enter, function () {
                //console.log('setdns enter');
                //var value =  $('input[name = dns]').val();
                //if (value == '') {
                //} else {
                //    storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,'gateway',value);
                //    router.navigate('setposkey',{trigger:true});
                //}
                _self.onNextClicked();
            });
        },

        onNextClicked: function () {
            var value =  $('input[name = dns]').val();
            if (value == '') {
                layer.msg('请输入有效网关', optLayerWarning);
            } else {
                storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,'gateway',value);
                router.navigate('setposkey',{trigger:true});
            }
        }


    });

    return setDNSView;
});