/**
 * Created by gjwlg on 2016/9/9.
 */
require.config({
    waitSeconds:0,
    baseUrl:'./js/lib/',
    paths:{
        'jquery':'jquery-2.2.3',
        'storage':'../jquery-storageapi/jquery.storageapi.min',
        'underscore':'underscore',
        'backbone':'backbone.min',
        "validation": "backbone-validation",
        'common':'common',
        'toastr':'../toastr/toastr.min',
        'remodal':'../remodal/remodal',
        'bootstrap':'../bootstrap/js/bootstrap',
        'text': 'requirePlugin/text',
        'css': 'requirePlugin/css',
        'json': 'requirePlugin/json',
        '_fetchText': 'requirePlugin/_fetchText',
    },
    shim:{
        'backbone':{
            'deps':['underscore'],
            'exports':'Backbone'
        },
        "validation": {
            "deps": ["backbone"],
            "exports": "validation"
        },
        'underscore':{
            'exports':'_'
        },
        'bootstrap':{
            'deps':['jquery','css!../bootstrap/css/bootstrap.css','css!../bootstrap/css/bootstrap-theme.css'],
            'exports':'Bootstrap'
        },
        'storage':{
            'deps':['jquery']
        },
        'md5':{
            'deps':['jquery']
        },
        'toastr':{
            'deps':['css!../toastr/toastr.css'],
            'exports':'toastr'
        },
        'remodal':{
            'deps':['css!../remodal/remodal.css','css!../remodal/remodal-default-theme.css'],
            'exports':'remodal'
        }
    }
});

require([
    'jquery',
    'underscore',
    'backbone',
    'common',
    'js/common/Router.js',
    'validation',
    'bootstrap',
    'storage',
    'toastr',
    'remodal'
], function ($,_,Backbone,common,BaseRouter,validation,Bootstrap,storage,toastr,remodal) {
    window.storage = $.localStorage;

    Backbone.history.start();
    _.extend(Backbone.Model.prototype, Backbone.Validation.mixin);

    // ������Ա�־
    window.debug = true;
    // ���� api �ӿ� url
    window.API = "http://111.198.72.128:3000/v1";
    // ����api���Ա�־
    window.api_debug = true;
    // ���¶���ϵͳ���ش洢����

    //��ʼ����һ�ε�½����
    //if (!window.storage.isSet(system_config.IS_FIRST_KEY)) {
    //    window.storage.set(system_config.IS_FIRST_KEY, true);
    //}
    // ��д����̨�����������ӵ��Ա�־
    console.log = (function (oriLogFunc) {
        return function (str) {
            if (debug) {
                oriLogFunc.call(console, str);
            }
        }
    })(console.log);

    window.TOKEN = {
        set: function (token) {
            window.storage.set(system_config.TOKEN_KEY, token);
        },
        get: function () {
            return window.storage.get(system_config.TOKEN_KEY);
        },
        remove: function () {
            window.storage.remove(system_config.TOKEN_KEY);
        }
    };

    window.LOGIN_USER = {
        set: function (login_user) {
            window.storage.set(window.system_config.LOGIN_USER_KEY, login_user);
        },
        get: function () {
            window.storage.get(window.system_config.LOGIN_USER_KEY);
        }
    };

    window.POS_KEY = {
        set: function (key) {
            // todo Ԥ�÷���
        },
        get: function () {
            var pos_key = window.storage.get(system_config.SETTING_DATA_KEY, system_config.INIT_DATA_KEY, system_config.POS_KEY);
            return pos_key;
        }
    };

    window.GATEWAY = {
        set: function () {

        },
        get: function () {
            return window.storage.get(system_config.SETTING_DATA_KEY, system_config.INIT_DATA_KEY, system_config.GATEWAY_KEY);
        }
    };

    window.common_params = function (params) {
        var _p = $.isEmptyObject(params) ? {} : params;
        return $.extend(_p, {
            "poskey": window.POS_KEY.get(),
            "token": window.TOKEN.get(),
            "timestamp": new Date().format("yyyy-MM-dd hh:mm:ss"),
            "sign": "" // todo ǩ�����԰汾����Ҫ���
        });
    };

    window.router = BaseRouter;

    document.onselectstart = function () {
        return false;
    };

    function forbidBackSpace(e) {
        var ev = e || window.event; //��ȡevent����
        var obj = ev.target || ev.srcElement; //��ȡ�¼�Դ
        var t = obj.type || obj.getAttribute('type'); //��ȡ�¼�Դ����
        //��ȡ��Ϊ�ж��������¼�����
        var vReadOnly = obj.readOnly;
        var vDisabled = obj.disabled;
        //����undefinedֵ���
        vReadOnly = (vReadOnly == undefined) ? false : vReadOnly;
        vDisabled = (vDisabled == undefined) ? true : vDisabled;
        //����Backspace��ʱ���¼�Դ����Ϊ������С������ı��ģ�
        //����readOnly����Ϊtrue��disabled����Ϊtrue�ģ����˸��ʧЧ
        var flag1 = ev.keyCode == 8 && (t == "password" || t == "text" || t == "textarea") && (vReadOnly == true || vDisabled == true);
        //����Backspace��ʱ���¼�Դ���ͷ�������С������ı��ģ����˸��ʧЧ
        var flag2 = ev.keyCode == 8 && t != "password" && t != "text" && t != "textarea";
        //�ж�
        if (flag2 || flag1) return false;
    }
    //��ֹ���˼� ������Firefox��Opera
    document.onkeypress = forbidBackSpace;
    //��ֹ���˼�  ������IE��Chrome
    document.onkeydown = forbidBackSpace;

    $(document).ready(function () {
        window.loading = {
            show: function (obj) {
                var target = obj || $("body");
                target.showLoading({
                    overlayWidth: $(document).width(),
                    overlayHeight: $(document).height()
                });
            },

            hide: function (obj) {
                var target = obj || $("body");
                target.hideLoading();
            }
        };

        /**
         * ������Ļ���
         */
        var setScreenWH = function () {
            var dw = $(document).width(),
                dh = $(document).height();
            var cw = $("#container").width(),
                ch = $("#container").height();
            var cwd = dw - cw;
            var chd = dh - ch;
            var cl = 0;
            var ct = 0;
            if (cwd > 0) {
                cl = cwd / 2;
            }
            if (chd > 0) {
                ct = chd / 2;
            }
            $("#container").css({
                "left": cl,
                "top": ct
            });
        };

        setScreenWH();

    });



});