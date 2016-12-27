/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/lockscreen/model',
    'text!../../../../moduals/lockscreen/usertpl.html',
    'text!../../../../moduals/lockscreen/tpl.html'
], function (BaseView, LockscreenModel, usertpl, tpl) {

    var lockscreenView = BaseView.extend({

        id: "lockscreenView",

        el: '.views',

        template: tpl,

        template_user: usertpl,

        input: 'input[name = passwd]',

        events: {
            'click .btn-numpad': 'onNumpadClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked',
            'click .unlock': 'onUnlockClicked'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.LOCKSCREEN;
            this.model = new LockscreenModel();
            this.model.set({
                username: storage.get(system_config.LOGIN_USER_KEY, 'user_id')
            });
            this.template_user = _.template(this.template_user);
            this.requestModel = new LockscreenModel();
        },

        initPlugins: function () {
            $(this.input).focus();
            this.renderUser();
        },

        //onNumpadClicked: function () {
        //    var isDisplay = $('.numpad').css('display') == 'none';
        //    if (isDisplay) {
        //        $('.numpad').css('display', 'block');
        //        $('.btn-numpad').text('关闭小键盘');
        //    } else {
        //        $('.numpad').css('display', 'none');
        //        $('.btn-numpad').text('打开小键盘');
        //    }
        //},

        renderUser: function () {
            this.$el.find('.for-lsuser').html(this.template_user(this.model.toJSON()));
            return this;
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

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(PAGE_ID.LOCKSCREEN, KEYS.Enter, function () {
                _self.onUnlockClicked();
            });
        },

        onUnlockClicked: function () {
            var passwd = $(this.input).val();
            if (passwd == '') {
                layer.msg('请输入登录密码', optLayerWarning);
                return;
            }
            var data = {};
            data['user_id'] = storage.get(system_config.LOGIN_USER_KEY, 'user_id');
            data['user_password'] = $.md5(passwd);
            data['accredit_type'] = '00';
            this.requestModel.login(data, function (resp) {
                if (resp.status == '00') {
                    var pageid = storage.get(system_config.LAST_PAGE);
                    switch (pageid) {
                        case PAGE_ID.LOGIN:
                            router.navigate('login', {trigger: true, replace: true});
                            break;
                        case PAGE_ID.MAIN:
                            router.navigate('main', {trigger: true, replace: true});
                            break;
                        case PAGE_ID.BILLING:
                            router.navigate('billing', {trigger: true, replace: true});
                            break;
                        case PAGE_ID.BILLING_RETURN:
                            router.navigate('billingreturn', {trigger: true, replace: true});
                            break;
                        case PAGE_ID.RETURN_WHOLE:
                            router.navigate('returnwhole', {trigger: true, replace: true});
                            break;
                        case PAGE_ID.RETURN_FORCE:
                            router.navigate('returnforce', {trigger: true, replace: true});
                            break;
                        case PAGE_ID.CHECKING:
                            router.navigate('checking', {trigger: true, replace: true});
                            break;
                    }
                } else {
                    layer.msg(resp.msg, optLayerError);
                }
            });
        }

    });

    return lockscreenView;
});