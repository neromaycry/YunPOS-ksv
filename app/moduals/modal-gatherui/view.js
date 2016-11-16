/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-gatherui/model',
    'text!../../moduals/modal-gatherui/contenttpl.html',
    'text!../../moduals/modal-gatherui/commontpl.html',
    'text!../../moduals/modal-gatherui/alipaytpl.html',
    'text!../../moduals/modal-gatherui/wechatpaytpl.html',
    'text!../../moduals/modal-gatherui/quickpaytpl.html',
    'text!../../moduals/modal-gatherui/numpadtpl.html',
    'text!../../moduals/modal-gatherui/tpl.html'
], function (BaseModalView, GatherUIModel, contenttpl, commontpl, alipaytpl, wechatpaytpl,quickpaytpl,numpadtpl, tpl) {

    var gahterUIView = BaseModalView.extend({

        id: "gahterUIView",

        template: tpl,

        template_numpad:numpadtpl,

        gatherUI:'',

        events: {
            'click .cancel':'onCancelClicked',
            'click .btn-num':'onNumClicked',
            'click .ok':'onOKClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
            //'click .alipay-cancel':'onAliCancelClicked',
            //'click .alipay-ok':'onAliOkClicked'
        },

        modalInitPage: function () {
            this.gatherUI = this.attrs.gather_ui;
            this.switchTemplate(this.gatherUI);
            this.template_content = _.template(this.template_content);
            this.model = new GatherUIModel();
            this.model.set({
                gather_name:this.attrs.gather_name
            });
            this.prepay(this.gatherUI);
            this.render();
            if(this.gatherUI == '01') {
                this.renderContent();
            }else {
                this.renderThirdPay();
            }
            this.$el.find('.for-numpad').html(this.template_numpad);
        },

        prepay: function (gatherUI) {
            var data = {};
            if (gatherUI == '04') {
                data['orderid'] = this.attrs.orderNo;
                data['merid'] = '000201504171126553';
                data['totalfee'] = '0.01';
                data['body'] = 'test';
                data['subject'] = 'test';
                data['paymethod'] = 'zfb';
                data['payway'] = 'scancode';
                data['zfbtwo'] = 'zfbtwo';
            } else if (gatherUI == '05') {
                data['orderid'] = this.attrs.orderNo;
                data['merid'] = '000201504171126553';
                data['totalfee'] = '0.01';
                data['body'] = 'test';
                data['subject'] = 'test';
                data['paymethod'] = 'wx';
            }else {
                return false;
            }
            resource.post('http://114.55.62.102:9090/api/pay/xfb/prepay', data, function (resp) {
                console.log(resp);
                $('.qrcode-img').attr('src', resp.data.codeurl);
            });
        },

        renderContent: function () {
            this.$el.find('.gatherui-content').html(this.template_content(this.model.toJSON()));
            return this;
        },

        renderThirdPay: function () {
            this.$el.find('.third-pay').html(this.template_content(this.model.toJSON()));
            return this;
        },

        switchTemplate: function (gatherUI) {
            switch (gatherUI) {
                case '01':
                    this.template_content = commontpl;
                    this.input = 'input[name = receive_account]';
                    break;
                case '04':
                    this.template_content = alipaytpl;
                    this.input = 'input[name = alipay-account]';
                    break;
                case '05':
                    this.template_content = wechatpaytpl;
                    this.input = 'input[name = wechat-account]';
                    break;
            }
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(this.attrs.currentid, window.KEYS.Esc , function () {
               _self.confirmHideModal(_self.attrs.pageid);
                $('input[name = billing]').focus();
            });
            this.bindModalKeyEvents(this.attrs.currentid, window.KEYS.Enter, function () {
                var gatherNo = $(_self.input).val();
                if(gatherNo == '') {
                    toastr.warning('账号不能为空');
                }else if(gatherNo == '0') {
                    toastr.warning('账号不能为零');
                }else if((gatherNo.split('.').length-1) > 0) {
                        toastr.warning('请输入有效的账号');
                }else {
                    _self.attrs.callback(_self.attrs);
                    _self.confirmHideModal(_self.attrs.pageid);
                }
            });
        },

        onNumClicked: function (e) {
            var value = $(e.currentTarget).data('num');
            var str = $(this.input).val();
            str += value;
            $(this.input).val(str);
        },

        onCancelClicked: function () {
            this.confirmHideModal(this.attrs.pageid);
        },

        onOKClicked: function () {
            var gatherNo = $(this.input).val();
            if(gatherNo == '') {
                toastr.warning('账号不能为空');
            }else if(gatherNo == '0') {
                toastr.warning('账号不能为零');
            }else if((gatherNo.split('.').length-1) > 0) {
                toastr.warning('请输入有效的账号');
            }else{
                this.attrs.callback(this.attrs);
                this.confirmHideModal(this.attrs.pageid);
            }
        },

        onBackspaceClicked: function (e) {
            var str = $(this.input).val();
            str = str.substring(0, str.length-1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

        onAliCancelClicked: function () {
            this.confirmHideModal(this.attrs.pageid);
        },

        onAliOkClicked: function () {
            this.attrs.callback(this.attrs);
            this.confirmHideModal(this.attrs.pageid);
        }



    });

    return gahterUIView;
});