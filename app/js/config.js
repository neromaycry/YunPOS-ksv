/**
 * Created by gjwlg on 2016/9/9.
 */
requirejs.config({
    waitSeconds: 0,
    baseUrl: './js/lib/',
    paths: {
        'jquery': 'jquery-2.2.3',
        "serializeObject": "jquery.serializeObject",
        'storage': '../jquery-storageapi/jquery.storageapi',
        'underscore': 'underscore',
        'backbone': 'backbone.min',
        "md5": "jQuery.md5",
        'validation': 'backbone-validation',
        'loading': '../loading/jquery.showLoading.min',
        'common': 'common',
        'toastr': '../toastr/toastr.min',
        'bootstrap': '../bootstrap/js/bootstrap',
        'pscrollbar': '../perfect-scrollbar/js/perfect-scrollbar.jquery',
        'text': 'requirePlugin/text',
        'css': 'requirePlugin/css',
        'json': 'requirePlugin/json',
        '_fetchText': 'requirePlugin/_fetchText',
        'xfb': 'jquery-resource',
        'marquee':'../marquee/jquery.marquee',
        'Recwebsocket':'../reconnecting-websocket/reconnecting-websocket',
        'fecha':'../fecha/fecha',
        'noty': '../noty/jquery.noty.packaged',
        'koala': '../koala/jquery.koala',
        'layer': '../layer/layer'
    },
    shim: {
        'backbone': {
            'deps': ['underscore'],
            'exports': 'Backbone'
        },
        'validation': {
            'deps': ["backbone"],
            'exports': 'validation'
        },
        'underscore': {
            'exports': '_'
        },
        "serializeObject": {
            "deps": ["jquery"]
        },
        'xfb': {
            'deps': ['jquery'],
            'exports': 'xfb'
        },
        'noty': {
            'deps': ['jquery'],
            'exports': 'noty'
        },
        'koala': {
            'deps': ['jquery'],
            'exports': 'koala'
        },
        'layer': {
            'deps': ['jquery', 'css!../layer/skin/default/layer.css'],
            'exports': 'layer'
        },
        'Recwebsocket':{
            'exports':'Recwebsocket'
        },
        'fecha': {
            'exports': 'fecha'
        },
        'marquee': {
            'deps': ['jquery'],
            'exports': 'marquee'
        },
        'bootstrap': {
            'deps': ['jquery', 'css!../bootstrap/css/bootstrap.css', 'css!../bootstrap/css/bootstrap-theme.css'],
            'exports': 'Bootstrap'
        },
        'storage': {
            'deps': ['jquery']
        },
        'loading': {
            "deps": [
                'css!../loading/showLoading.css',
                'jquery'
            ]
        },
        'md5': {
            'deps': ['jquery']
        },
        'toastr': {
            'deps': ['css!../toastr/toastr.css'],
            'exports': 'toastr'
        },
        'pscrollbar': {
            'deps': ['css!../perfect-scrollbar/css/perfect-scrollbar.min.css'],
            'exports': 'pscrollbar'
        },
    }
});

requirejs([
    'jquery',
    'underscore',
    'backbone',
    'common',
    'serializeObject',
    'js/common/Router.js',
    'validation',
    'bootstrap',
    'loading',
    'storage',
    'toastr',
    'pscrollbar',
    'md5',
    'xfb',
    'marquee',
    'Recwebsocket',
    'fecha',
    'noty',
    'koala',
    'layer'
], function ($, _, Backbone, common, serializeObject, BaseRouter, validation, Bootstrap, loading, storage, toastr, pscrollbar, md5, xfb, marquee, Recwebsocket, fecha, noty, koala, layer) {

    window.isAndroid = false;  //是否为Android设备

    window.storage = $.localStorage;

    window.pageId = 0;  //每个页面的pageid

    window.isfromForce = false;

    window.isFromLogin = false;

    window.isModal = false;  //当前页面是否是模态框

    window.psbar = pscrollbar;

    window.fecha = fecha;

    window.isPacked = false;  //程序是否已打包，打包前必须把此项设置为true

    window.layer = layer;

    window.layerindex = undefined;

    window.optLayerWarning = {
        icon: 0,
        time: 3000
    };

    window.optLayerSuccess = {
        icon: 1,
        time: 3000
    };

    window.optLayerError = {
        icon: 2,
        time: 3000
    };

    window.optLayerHelp = {
        icon: 3,
        time: 3000
    };

    //layer.open({
    //    content: '测试回调',
    //    success: function(layero, index){
    //        console.log(layero, index);
    //    }
    //});

    window.storage.set('pos_limit', '11112111111');

    var pos_limit = window.storage.get('pos_limit').toString();
    console.log(pos_limit);

    window.auth_discount = pos_limit.charAt(0); //折扣控制
    window.auth_report = pos_limit.charAt(1);  //报表控制
    window.auth_store = pos_limit.charAt(2);  //百货控制
    window.auth_receipt = pos_limit.charAt(3);  //打印小票
    window.auth_return = pos_limit.charAt(4);  //退货控制
    window.auth_delete = pos_limit.charAt(5);  //删除控制
    window.auth_quling = pos_limit.charAt(6);  //去零控制
    window.auth_cashdrawer = pos_limit.charAt(7);  //打开钱箱
    window.auth_reprint = pos_limit.charAt(8);  //复制小票
    window.auth_manualvip = pos_limit.charAt(9);  //手输vip控制
    window.auth_ecardswipe = pos_limit.charAt(10);  //一卡通刷卡输入口令


    if (window.isPacked) {
        window.isClientScreenShow = window.storage.get(system_config.IS_CLIENT_SCREEN_SHOW);  //是否显示客显
        if (isClientScreenShow) {
            var gui = window.requireNode(['nw.gui']);
            window.clientScreen = gui.Window.open("client.html", {
                title: '云POS',
                height: 1000,
                width: 1920,
                toolbar: false
            });
            window.clientScreen.moveTo(1366, 0);
            window.clientScreen.enterKioskMode();
            window.clientScreen.on ('loaded', function(){
                // the native onload event has just occurred
                window.clientDom = window.clientScreen.window.document;
                var clientH = $(window.clientDom).height();
                var clientW = $(window.clientDom).width();
                console.log('clientHeight:' + clientH + ',clientWidth:' + clientW);
                $(window.clientDom).find('img').height(clientH - 150);
                $(window.clientDom).find('img').css('width', '100%');
            });
        }
    }

    Backbone.history.start();
    _.extend(Backbone.Model.prototype, Backbone.Validation.mixin);

    //toastr的初始化设置
    window.toastr = toastr;
    window.toastr.options = {
        'timeOut': '4000',
        'positionClass': 'toast-bottom-center'
    };

    var SOCKET_ADDR = 'ws://localhost:7110/';
    //var SOCKET_ADDR = 'ws://192.168.1.114:2001/';

    window.wsClient = new Recwebsocket(SOCKET_ADDR);
    window.wsClient.onopen = function (e) {
        //window.toastr.success('已与硬件建立连接');
        window.layer.msg('已与硬件建立连接', optLayerSuccess);
    };
    window.wsClient.onmessage = function (e) {
        console.log(e);
    };
    window.wsClient.onclose = function (e) {
        //window.toastr.warning('与硬件连接断开');
        window.layer.msg('与硬件断开，请检查硬件', optLayerError);
    };
    window.wsClient.onerror = function (e) {
        //window.toastr.warning('与硬件连接出现问题，请检查硬件');
        console.log(e);
    };

    // 定义调试标志
    window.debug = true;
    // 定义 api 接口 url
    window.API = "http://111.198.72.128:3000/v1";
    // 定义api调试标志
    window.api_debug = true;
    // 重新定义系统本地存储对象

    //初始化第一次登陆参数
    //if (!window.storage.isSet(system_config.IS_FIRST_KEY)) {
    //    window.storage.set(system_config.IS_FIRST_KEY, true);
    //}
    // 重写控制台输出方法，添加调试标志
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
            // todo 预置方法
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
            "sign": "" // todo 签名测试版本不需要添加
        });
    };

    window.router = BaseRouter;

    document.onselectstart = function () {
        return false;
    };

    function forbidBackSpace(e) {
        var ev = e || window.event; //获取event对象
        var obj = ev.target || ev.srcElement; //获取事件源
        var t = obj.type || obj.getAttribute('type'); //获取事件源类型
        //获取作为判断条件的事件类型
        var vReadOnly = obj.readOnly;
        var vDisabled = obj.disabled;
        //处理undefined值情况
        vReadOnly = (vReadOnly == undefined) ? false : vReadOnly;
        vDisabled = (vDisabled == undefined) ? true : vDisabled;
        //当敲Backspace键时，事件源类型为密码或单行、多行文本的，
        //并且readOnly属性为true或disabled属性为true的，则退格键失效
        var flag1 = ev.keyCode == 8 && (t == "password" || t == "text" || t == "textarea") && (vReadOnly == true || vDisabled == true);
        //当敲Backspace键时，事件源类型非密码或单行、多行文本的，则退格键失效
        var flag2 = ev.keyCode == 8 && t != "password" && t != "text" && t != "textarea";
        //判断
        if (flag2 || flag1) return false;
    }

    //禁止后退键 作用于Firefox、Opera
    document.onkeypress = forbidBackSpace;
    //禁止后退键  作用于IE、Chrome
    document.onkeydown = forbidBackSpace;

    $(document).ready(function () {
        $('*').keydown(function (e) {
            e = window.event || e || e.which;
            if (e.keyCode == 112 || e.keyCode == 113
                || e.keyCode == 114 || e.keyCode == 115
                || e.keyCode == 116 || e.keyCode == 117
                || e.keyCode == 118 || e.keyCode == 119
                || e.keyCode == 120 || e.keyCode == 121
                || e.keyCode == 122 || e.keyCode == 123) {
                e.keyCode = 0;
                return false;
            }
        });
        window.onhelp = function () {
            //ie下面不能屏蔽f1键的补充方法
            return false;
        };


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
         * 设置屏幕宽高
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