/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/passwdchange/model',
    '../../../../moduals/layer-help/view',
    'text!../../../../moduals/passwdchange/numpadtpl.html',
    'text!../../../../moduals/passwdchange/tpl.html',
], function (BaseView, PasswdModel,LayerHelpView, numpadtpl, tpl) {

    var memberView = BaseView.extend({

        id: "passwdChangeView",

        el: '.views',

        template: tpl,

        template_numpad: numpadtpl,

        input: '',

        input_old_pwd: 'input[name = old_pwd]',

        input_new_pwd: 'input[name = new_pwd]',

        input_repeat_pwd: 'input[name = repeat_pwd]',

        events: {
            'click .numpad-ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked',
            'click .passwd_return': 'onReturnClicked',
            'click .passwd_help': 'onHelpClicked',
            'click input[name = new_pwd]': 'focusInputNew',
            'click input[name = repeat_pwd]': 'focusInputRepeat',
            'click input[name = old_pwd]': 'focusInputOld'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.PASSWD_CHANGE;
            this.model = new PasswdModel();
            this.initTemplates();
            this.handleEvents();
        },

        initPlugins: function () {
            $(this.input_old_pwd).focus();
            this.$el.find('.for-numpad').html(this.template_numpad);
        },


        handleEvents: function () {

        },

        initTemplates: function () {

        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.PASSWD_CHANGE, window.KEYS.Esc, function () {
                _self.onReturnClicked();
            });

            this.bindKeyEvents(window.PAGE_ID.PASSWD_CHANGE, window.KEYS.Down, function () {
                _self.onKeyDownClicked();
            });

            this.bindKeyEvents(window.PAGE_ID.PASSWD_CHANGE, window.KEYS.Up, function () {
                _self.onKeyUpClicked();
            });

            this.bindKeyEvents(window.PAGE_ID.PASSWD_CHANGE, window.KEYS.Enter, function () {
                _self.onOKClicked();
            });

            this.bindKeyEvents(window.PAGE_ID.PASSWD_CHANGE, window.KEYS.T, function () {
                _self.onHelpClicked();
            });
        },

        onHelpClicked: function () {
            var attrs = {
                page: 'PWD_CHANGE_PAGE',
                pageid: pageId
            };
            this.openLayer(PAGE_ID.LAYER_HELP, pageId, '帮助', LayerHelpView, attrs, {area: '600px'});
        },

        onKeyDownClicked: function () {
            var isOldPwdFocus = $('input[name = old_pwd]').is(':focus');
            var isNewPwdFocus = $('input[name = new_pwd]').is(':focus');
            var isRepeatFocus = $('input[name = repeat_pwd]').is(':focus');
            if(isOldPwdFocus) {
                this.input = this.input_new_pwd;
            }
            if(isNewPwdFocus) {
                this.input = this.input_repeat_pwd;
            }
            if(isRepeatFocus) {
                this.input = this.input_old_pwd;
            }
            $(this.input).focus();
        },

        onKeyUpClicked: function () {
            var isOldPwdFocus = $('input[name = old_pwd]').is(':focus');
            var isNewPwdFocus = $('input[name = new_pwd]').is(':focus');
            var isRepeatFocus = $('input[name = repeat_pwd]').is(':focus');
            if(isOldPwdFocus) {
                this.input = this.input_repeat_pwd;
            }
            if(isNewPwdFocus) {
                this.input = this.input_old_pwd;
            }
            if(isRepeatFocus) {
                this.input = this.input_new_pwd;
            }
            $(this.input).focus();
        },

        onOKClicked: function () {
            var oldPwd = $(this.input_old_pwd).val();
            var newPwd = $(this.input_new_pwd).val();
            var repeatPwd = $(this.input_repeat_pwd).val();
            console.log('旧密码： ' + oldPwd + '----新密码: ' + newPwd + '---重复密码：' + repeatPwd);
            if(oldPwd == '') {
                layer.msg('旧密码不能为空', optLayerWarning);
                return false;
            }
            if (newPwd == '') {
                layer.msg('新密码不能为空', optLayerWarning);
                return false;
            }
            if(repeatPwd == '') {
                layer.msg('重复输入新密码不能为空', optLayerWarning);
                return false;
            }
            if(newPwd != repeatPwd) {
                layer.msg('两次密码不一致', optLayerWarning);
                return false;
            }
            this.changePasswd(oldPwd, newPwd);
        },

        // 向接口发新旧密码
        changePasswd: function (oldPwd, newPwd) {
            var data = {
                user_id: storage.get(system_config.LOGIN_USER_KEY, 'user_id'),
                password: oldPwd,
                new_password: newPwd
            };

            this.model.password(data, function (resp) {
                console.log(typeof resp);
                if (resp.status == '00') {
                    layer.msg(resp.msg, optLayerSuccess);
                    router.navigate('login', {trigger: true});
                } else {
                    layer.msg(resp.msg, optLayerError);
                }
            });
        },

        focusInputNew: function () {
            this.input = this.input_new_pwd;
        },

        focusInputOld: function () {
            this.input = this.input_old_pwd;
        },

        focusInputRepeat: function () {
            this.input = this.input_repeat_pwd;
        },

        onNumClicked: function (e) {
            var value = $(e.currentTarget).data('num');
            var str = $(this.input).val();
            str += value;
            $(this.input).val(str);
        },
        onBackspaceClicked: function (e) {
            var str = $(this.input).val();
            str = str.substring(0, str.length - 1);
            $(this.input).val(str);
        },
        onClearClicked: function () {
            $(this.input).val('');
        },

        onReturnClicked: function () {
            router.navigate('main', {trigger: true});
        }


    });

    return memberView;
});