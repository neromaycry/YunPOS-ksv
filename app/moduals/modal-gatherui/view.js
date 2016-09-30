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
    'text!../../moduals/modal-gatherui/tpl.html'
], function (BaseModalView, GatherUIModel, contenttpl, commontpl, alipaytpl, wechatpaytpl, tpl) {

    var gahterUIView = BaseModalView.extend({

        id: "gahterUIView",

        template: tpl,


        events: {

        },

        modalInitPage: function () {
            console.log(this.attrs);
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
                    break;
                case '04':
                    this.template_content = alipaytpl;
                    break;
                case '05':
                    this.template_content = wechatpaytpl;
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



    });

    return gahterUIView;
});