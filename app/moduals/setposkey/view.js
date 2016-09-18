/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/setposkey/model',
    'text!../../../../moduals/setposkey/tpl.html'
], function (BaseView, SetPoskeyModel, tpl) {

    var setPoskeyView = BaseView.extend({

        id: "setPoskeyView",

        el: '.views',

        template: tpl,

        events: {

        },

        pageInit: function () {
            pageId = window.PAGE_ID.SETPOSKEY;

        },

        initPlugins: function () {
            $('input[name = poskey]').focus();
        },

        bindKeys: function () {
            this.bindKeyEvents(window.PAGE_ID.SETPOSKEY, window.KEYS.Enter, function () {
                var value =  $('input[name = poskey]').val();
                if (value == '') {
                    toastr.warning('请输入有效的授权key');
                } else {
                    var data = {};
                    data['poskey'] = value;
                    this.request = new SetPoskeyModel();
                    this.request.init(data,function(resp){
                        if(resp.status == '00'){
                            router.navigate('initinfo',{ trigger: true });
                            storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,'poskey',value);
                        } else {
                            toastr.error(resp.msg);
                        }
                    });
                }
            });

            this.bindKeyEvents(window.PAGE_ID.SETPOSKEY, window.KEYS.Esc, function () {
                router.navigate('setdns', {trigger:true});
            });
        }


    });

    return setPoskeyView;
});