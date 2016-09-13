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

        template: tpl,

        events: {

        },

        modalInitPage: function () {
            console.log(this.attrs);
            var _self = this;
            this.model = new KeyTipsModel();
            this.collection = new KeyTipsCollection();
            this.collection.set(storage.get(system_config.SETTING_DATA_KEY,system_config.SHORTCUT_KEY,this.attrs));
            //$('.modal').on('show.bs.modal', function () {
            //    _self.renderHotKeys();
            //});
            this.renderHotKeys();
            $('.modal').on('shown.bs.modal', function () {
                _self.renderHotKeys();
            });
        },

        renderHotKeys: function () {
            this.$el.html(this.template(this.collection.toJSON()));
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