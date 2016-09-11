/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/keytips-member/model',
    '../../moduals/keytips-member/collection',
    'text!../../moduals/keytips-member/tpl.html'
], function (BaseModalView,KeyTipsModel,KeyTipsCollection, tpl) {

    var kMemberView = BaseModalView.extend({

        id: "kMemberView",

        template_collection: tpl,

        events: {

        },

        modalInitPage: function () {
            console.log(this.attrs);
            this.collection = new KeyTipsCollection();
            this.collection.set(storage.get(system_config.SETTING_DATA_KEY,system_config.SHORTCUT_KEY,this.attrs));
            this.template_collection = _.template(this.template_collection);
            this.renderHotKeys();
        },

        renderHotKeys: function () {
            this.$el.html(this.template_collection(this.collection));
            return this;
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.TIP_MEMBER, window.KEYS.Esc , function () {
                _self.hideModal(window.PAGE_ID.MEMBER);
            });
        }

    });

    return kMemberView;
});