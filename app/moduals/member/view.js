/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/member/model',
    '../../../../moduals/keytips-member/view',
    'text!../../../../moduals/member/memberinfotpl.html',
    'text!../../../../moduals/member/tpl.html',
], function (BaseView, MemberModel, KMemberView, memberinfotpl, tpl) {

    var memberView = BaseView.extend({

        id: "memberView",

        el: '.views',

        template: tpl,

        template_memberinfo:memberinfotpl,

        isRequestSuccess:false,

        input:'input[name = custid]',

        events: {
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click input[name = custid]':'focusInputCustid',
            'click input[name = custpwd]':'focusInputPasswd',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.MEMBER;
            this.model = new MemberModel();
            this.requestModel = new MemberModel();
            this.initTemplates();
        },

        initPlugins: function () {
            $('input[name = custid]').focus();
            this.renderMemberInfo();
        },

        initTemplates: function () {
            this.template_memberinfo = _.template(this.template_memberinfo);
        },

        renderMemberInfo:function () {
            this.$el.find('.for-memberinfo').html(this.template_memberinfo(this.model.toJSON()));
            return this;
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.MEMBER, window.KEYS.Esc, function () {
                router.navigate('main',{trigger:true});
            });
            this.bindKeyEvents(window.PAGE_ID.MEMBER, window.KEYS.T, function () {
                var tipsView = new KMemberView('MEMBER_PAGE');
                _self.showModal(window.PAGE_ID.TIP_MEMBER, tipsView);
            });
            this.bindKeyEvents(window.PAGE_ID.MEMBER, window.KEYS.Enter, function () {
                var isUserFocused = $('input[name = custid]').is(':focus');
                if (_self.isRequestSuccess) {
                    storage.set(system_config.VIP_KEY,_self.model.toJSON());
                    toastr.success('会员登录成功');
                    router.navigate('main',{trigger:true});
                } else {
                    if (isUserFocused) {
                        $('input[name = custpwd]').focus();
                    } else {
                        _self.requestMemberInfo();
                    }
                }
            });
            this.bindKeyEvents(window.PAGE_ID.MEMBER,window.KEYS.Left, function () {
                var isUserFocused = $('input[name = custid]').is(':focus');
                if (isUserFocused) {
                    $('input[name = custpwd]').focus();
                } else {
                    $('input[name = custid]').focus();
                }
            });
            this.bindKeyEvents(window.PAGE_ID.MEMBER, window.KEYS.Right, function () {
                var isUserFocused = $('input[name = custid]').is(':focus');
                if (isUserFocused) {
                    $('input[name = custpwd]').focus();
                } else {
                    $('input[name = custid]').focus();
                }
            });
        },

        focusInputCustid: function () {
            this.input = 'input[name = custid]';
        },

        focusInputPasswd: function () {
            this.input = 'input[name = custpwd]';
        },

        onNumClicked: function (e) {
            var value = $(e.currentTarget).data('num');
            var str = $(this.input).val();
            str += value;
            $(this.input).val(str);
        },

        onOKClicked: function () {
            var isUserFocused = $('input[name = custid]').is(':focus');
            if (this.isRequestSuccess) {
                storage.set(system_config.VIP_KEY,this.model.toJSON());
                toastr.success('会员登录成功');
                router.navigate('main',{trigger:true});
            } else {
                if (isUserFocused) {
                    $('input[name = custpwd]').focus();
                } else {
                    this.requestMemberInfo();
                }
            }
        },

        onBackspaceClicked: function (e) {
            var str = $(this.input).val();
            str = str.substring(0, str.length-1);
            $(this.input).val(str);
        },

        onClearClicked: function (e) {
            $(this.input).val('');
        },

        requestMemberInfo: function () {
            var _self = this;
            var cardid = $('input[name = custid]').val();
            var pwd = $('input[name = custpwd]').val();
            if (cardid == '' || pwd == '') {
                toastr.warning('卡号或密码不能为空');
            } else {
                var data = {};
                var md5pwd = $.md5(pwd);
                data['cardid'] = cardid;
                data['password'] = md5pwd;
                data['type'] = '00';
                this.requestModel.getMemberInfo(data, function (resp) {
                    if (resp.status == '00') {
                        _self.model.set(resp);
                        _self.isRequestSuccess = true;
                        _self.renderMemberInfo();
                    } else {
                        toastr.error(resp.msg);
                    }
                });
            }
        }

    });

    return memberView;
});