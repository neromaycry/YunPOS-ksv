/**
 * Created by lyting on 16-4-25.
 */
define(['backbone'], function (Backbone) {

    var Router = Backbone.Router.extend({

        routes: {
            '': 'login',
            'login':'login',
            'main':'main',
            'salesman':'salesman',
            'member':'member',
            'billing':'billing',
            'restorder':'restorder',
            'returnforce':'returnforce'
        },

        //路由初始化可以做一些事
        initialize: function () {

        },

        login: function () {
            var _url = './moduals/login/view.js';
            require([_url], function (View) {
                var view = new View();
                view.render();
            });
        },

        main: function () {
            var _url = './moduals/main/view.js';
            require([_url], function (View) {
                var view = new View();
                view.render();
            });
        },

        member: function () {
            var _url = './moduals/member/view.js';
            require([_url], function (View) {
                var view = new View();
                view.render();
            });
        },

        salesman: function () {
            var _url = './moduals/modal-salesman/view.js';
            require([_url], function (View) {
                var view = new View();
                view.render();
            });
        },

        billing: function () {
            var _url = './moduals/billing/view.js';
            require([_url], function (View) {
                var view = new View();
                view.render();
            });
        },

        restorder: function () {
            var _url = './moduals/restorder/view.js';
            require([_url], function (View) {
                var view = new View();
                view.render();
            });
        },

        returnforce: function () {
            var _url = './moduals/return-force/view.js';
            require([_url], function (View) {
                var view = new View();
                view.render();
            });
        },

        defaultAction: function () {
            router.navigate("login", {trigger: true});
        }
    });
    var router = new Router();
    return router;    //这里必须的，让路由表执行
});
