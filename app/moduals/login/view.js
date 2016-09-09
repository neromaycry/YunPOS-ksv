/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/login/model',
    'text!../../../../moduals/login/tpl.html',
], function (BaseView, LoginModel, tpl) {

    var loginView = BaseView.extend({

        id: "loginView",

        el: '.views',

        template: tpl,

        events: {
            'click #btn_login':'doLogin'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.LOGIN;
            storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,system_config.GATEWAY_KEY,'http://111.198.72.128:3000/v1');
            storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,system_config.POS_KEY,'1');
            this.requestModel = new LoginModel();
            this.model = new LoginModel();
            var data = {};
            data['modify_date'] = '19700101000000';
            this.requestModel.getGatherDetail(data, function (resp) {
                if(resp.status == '00') {
                    storage.set(system_config.GATHER_KEY,resp.gather_detail);
                    toastr.success('支付方式列表更新成功');
                } else {
                    toastr.error(resp.msg);
                }
            });
        },

        doLogin: function () {
            var username = $('input[name = username]').val();
            var password = $('input[name = password]').val();
            if (username == '') {
                toastr.warning('请输入用户名');
                return;
            }
            if (password == '') {
                toastr.warning('请输入密码');
                return;
            }
            var data = {};
            data['user_id'] = username;
            data['user_password'] = $.md5(password);
            data['accredit_type'] = '00';
            this.model.login(data,function (response) {
                if (!$.isEmptyObject(response)) {
                    if (response.status == "00") {
                        storage.set(window.system_config.LOGIN_USER_KEY, response);
                        storage.set(window.system_config.TOKEN_KEY, response["token"]);
                        router.navigate("main", {
                            trigger: true,
                            replace: true
                        });
                        toastr.success('登录成功');
                    } else {
                        toastr.error(response.msg);
                    }
                } else {
                    toastr.error(response.msg);
                }
            });
        }

    });

    return loginView;
});