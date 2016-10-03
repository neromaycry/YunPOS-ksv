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
    'text!../../moduals/modal-gatherui/tpl.html'
], function (BaseModalView, GatherUIModel, contenttpl, commontpl, alipaytpl, wechatpaytpl,quickpaytpl, tpl) {

    var gahterUIView = BaseModalView.extend({

        id: "gahterUIView",

        template: tpl,

        events: {
            'click .cancel':'onCancelClicked',
            'click .btn-num':'onNumClicked',
            'click .ok':'onOKClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
            'click .alipay-cancel':'onAliCancelClicked',
            'click .alipay-ok':'onAliOkClicked'
        },

        modalInitPage: function () {
            var gatherUI = this.attrs.gather_ui;
            this.switchTemplate(gatherUI);
            this.template_content = _.template(this.template_content);
            this.model = new GatherUIModel();
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
            });
            this.bindModalKeyEvents(this.attrs.currentid, window.KEYS.Enter, function () {
                _self.attrs.callback(_self.attrs);
                _self.confirmHideModal(_self.attrs.pageid);

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
            this.attrs.callback(this.attrs);
            this.confirmHideModal(this.attrs.pageid);
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