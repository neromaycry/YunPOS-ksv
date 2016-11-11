/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-rtgatherui/model',
    'text!../../moduals/modal-rtgatherui/contenttpl.html',
    'text!../../moduals/modal-rtgatherui/commontpl.html',
    'text!../../moduals/modal-rtgatherui/alipaytpl.html',
    'text!../../moduals/modal-rtgatherui/wechatpaytpl.html',
    'text!../../moduals/modal-rtgatherui/quickpaytpl.html',
    'text!../../moduals/modal-rtgatherui/tpl.html'
], function (BaseModalView, GatherUIModel, contenttpl, commontpl, alipaytpl, wechatpaytpl,quickpaytpl, tpl) {

    var gahterUIView = BaseModalView.extend({

        id: "gahterUIView",

        template: tpl,

        gatherUI:'',

        events: {
            'click .cancel':'onCancelClicked',
            'click .btn-num':'onNumClicked',
            'click .ok':'onOKClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
        },

        modalInitPage: function () {
            this.gatherUI = this.attrs.gather_ui;
            this.switchTemplate(this.gatherUI);
            this.template_content = _.template(this.template_content);
            this.model = new GatherUIModel();
            this.model.set({
                gather_name:this.attrs.gather_name
            });
            this.render();
            this.renderContent();
        },

        renderContent: function () {
            this.$el.find('.gatherui-content').html(this.template_content(this.model.toJSON()));
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
                $('input[name = billingrt]').focus();
            });
            this.bindModalKeyEvents(this.attrs.currentid, window.KEYS.Enter, function () {
                var gatherNo = $(_self.input).val();
                if(gatherNo == '') {
                    toastr.warning('退款账号不能为空');
                }else if(gatherNo == '0') {
                    toastr.warning('退款账号不能为零');
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
                toastr.warning('退款账号不能为空');
            }else if(gatherNo == '0') {
                toastr.warning('退款账号不能为零');
            }else {
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