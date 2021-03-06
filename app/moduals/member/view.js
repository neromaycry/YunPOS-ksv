/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/member/model',
    '../../../../moduals/keytips-member/view',
    '../../../../moduals/modal-membercard/view',
    '../../../../moduals/modal-phonenum/view',
    'text!../../../../moduals/member/memberinfotpl.html',
    'text!../../../../moduals/main/numpadtpl.html',
    'text!../../../../moduals/member/tpl.html',
], function (BaseView, MemberModel, KMemberView, MemberCardView, PhoneNumView, memberinfotpl, numpadtpl, tpl) {

    var memberView = BaseView.extend({

        id: "memberView",

        el: '.views',

        template: tpl,

        template_memberinfo: memberinfotpl,

        template_numpad: numpadtpl,

        isRequestSuccess: false,

        input: 'input[name = custid]',

        events: {
            'click .numpad-ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click input[name = custid]': 'focusInputCustid',
            'click input[name = custpwd]': 'focusInputPasswd',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked',
            'click .member_help': 'onHelpClicked',
            'click .member_return': 'onReturnClicked',
            'click [data-index]': 'onCardTypeClicked',
            'click #member-login': 'doMemberLogin'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.MEMBER;
            this.model = new MemberModel();
            this.requestModel = new MemberModel();
            this.initTemplates();
            this.handleEvents();
        },

        initPlugins: function () {
            $('input[name = custid]').focus();
            this.$el.find('.for-numpad').html(this.template_numpad);
            this.renderMemberInfo();
        },

        handleEvents: function () {
            Backbone.off('onMagcardResponse');
            Backbone.off('onPhoneNumResponse');
            Backbone.on('onMagcardResponse', this.onMagcardResponse, this);
            Backbone.on('onPhoneNumResponse', this.onPhoneNumResponse, this);
        },

        initTemplates: function () {
            this.template_memberinfo = _.template(this.template_memberinfo);
        },

        renderMemberInfo: function () {
            this.$el.find('.for-memberinfo').html(this.template_memberinfo(this.model.toJSON()));
            return this;
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.MEMBER, window.KEYS.Esc, function () {
                router.navigate('main', {trigger: true});
            });
            this.bindKeyEvents(window.PAGE_ID.MEMBER, window.KEYS.T, function () {
                var tipsView = new KMemberView('MEMBER_PAGE');
                _self.showModal(window.PAGE_ID.TIP_MEMBER, tipsView);
            });
            this.bindKeyEvents(window.PAGE_ID.MEMBER, window.KEYS.Enter, function () {
                //var isUserFocused = $('input[name = custid]').is(':focus');
                //if (_self.isRequestSuccess) {
                //    storage.set(system_config.VIP_KEY,_self.model.toJSON());
                //    router.navigate('main',{trigger:true});
                //} else {
                //    if (isUserFocused) {
                //        $('input[name = custpwd]').focus();
                //    } else {
                //        _self.requestMemberInfo();
                //    }
                //}
                _self.doMemberLogin();

            });
            this.bindKeyEvents(window.PAGE_ID.MEMBER, window.KEYS.Up, function () {
                var isUserFocused = $('input[name = custid]').is(':focus');
                if (isUserFocused) {
                    $('input[name = custpwd]').focus();
                } else {
                    $('input[name = custid]').focus();
                }
            });
            this.bindKeyEvents(window.PAGE_ID.MEMBER, window.KEYS.Down, function () {
                var isUserFocused = $('input[name = custid]').is(':focus');
                if (isUserFocused) {
                    $('input[name = custpwd]').focus();
                } else {
                    $('input[name = custid]').focus();
                }
            });

            this.bindKeyEvents(window.PAGE_ID.MEMBER, window.KEYS.X, function () {
                _self.onMCardLogin();
            });

            this.bindKeyEvents(window.PAGE_ID.MEMBER, window.KEYS.M, function () {
                _self.onPhoneNumLogin();
            });
        },

        /**
         *  磁条卡登陆
         */
        onMCardLogin: function () {
            var memberCardView = new MemberCardView();
            this.showModal(window.PAGE_ID.MODAL_MEMBER_CARD, memberCardView);
        },

        onPhoneNumLogin: function () {
            var phoneNumView = new PhoneNumView();
            this.showModal(window.PAGE_ID.MODAL_PHONENUM, phoneNumView);
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

        //onOKClicked: function () {
        //    var isUserFocused = $('input[name = custid]').is(':focus');
        //    if (this.isRequestSuccess) {
        //        storage.set(system_config.VIP_KEY,this.model.toJSON());
        //        router.navigate('main',{trigger:true});
        //    } else {
        //        if (isUserFocused) {
        //            $('input[name = custpwd]').focus();
        //        } else {
        //            this.requestMemberInfo();
        //        }
        //    }
        //},

        doMemberLogin: function () {
            if (this.isRequestSuccess) {
                storage.set(system_config.VIP_KEY, this.model.toJSON());
                layer.msg('会员登录成功', optLayerSuccess);
                router.navigate('main', {trigger: true});
            } else {
                layer.msg('请先查询会员信息', optLayerWarning);
            }
        },

        onBackspaceClicked: function (e) {
            var str = $(this.input).val();
            str = str.substring(0, str.length - 1);
            $(this.input).val(str);
        },

        onClearClicked: function (e) {
            $(this.input).val('');
        },

        requestMemberInfo: function () {
            var _self = this;
            var cardid = $('input[name = custid]').val();
            var pwd = $('input[name = custpwd]').val();
            if (cardid == '') {
                layer.msg('卡号不能为空', optLayerWarning);
            } else {
                var data = {};
                if (pwd != '') {
                    var md5pwd = $.md5(pwd);
                    data['password'] = md5pwd;
                } else {
                    data['password'] = '';
                }

                data['cardid'] = cardid;
                data['type'] = '00';
                this.requestModel.getMemberInfo(data, function (resp) {
                    if (resp.status == '00') {
                        _self.model.set(resp);
                        _self.isRequestSuccess = true;
                        _self.renderMemberInfo();
                    } else {
                        layer.msg(resp.msg, optLayerError);
                    }
                });
            }
        },
        onHelpClicked: function () {
            var tipsView = new KMemberView('MEMBER_PAGE');
            this.showModal(window.PAGE_ID.TIP_MEMBER, tipsView);
        },
        onReturnClicked: function () {
            router.navigate('main', {trigger: true});
        },

        onCardTypeClicked: function (e) {
            var index = $(e.currentTarget).data('index');
            console.log(index);
            switch (index) {
                case 0:
                    this.onMCardLogin();
                    break;
                case 1:
                    this.onPhoneNumLogin();
                    break
            }
        },

        onMagcardResponse: function (resp) {
            this.model.set(resp);
            this.isRequestSuccess = true;
            this.renderMemberInfo();
        },

        onPhoneNumResponse: function (resp) {
            this.model.set(resp);
            this.isRequestSuccess = true;
            this.renderMemberInfo();
        }

    });

    return memberView;
});