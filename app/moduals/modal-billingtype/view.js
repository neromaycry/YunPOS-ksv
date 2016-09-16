/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-billingtype/model',
    '../../moduals/modal-billingtype/collection',
    'text!../../moduals/modal-billingtype/billingtypetpl.html',
    'text!../../moduals/modal-billingtype/tpl.html',
], function (BaseModalView,BilltypeModel,BilltypeCollection,billingtypetpl, tpl) {

    var billtypeView = BaseModalView.extend({

        id: "billtypeView",

        template: tpl,

        template_billingtype:billingtypetpl,

        modalInitPage: function () {
            console.log(this.attrs);
            console.log('**************');
            if(storage.isSet(system_config.GATHER_KEY)) {
                this.collection = new BilltypeCollection();
            }

            this.initTemplates();
            this.handleEvents();
        },

        initTemplates: function () {
            this.template_billingtype = _.template(this.template_billingtype);
        },

        handleEvents: function () {
            Backbone.off('onReleaseBillingtype');
            Backbone.on('onReleaseBillingtype', this.onReleaseBillingtype, this);
        },
        onReleaseBillingtype: function (data) {
            this.collection = new BilltypeCollection();
            this.collection.set(data.toJSON());
            this.renderBilltype();
        },
        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.BILLING_TYPE, window.KEYS.Esc , function () {
                _self.hideModal(window.PAGE_ID.BILLING);
            });
        },

        bindModalKeyEvents: function (id,keyCode,callback) {
            $(document).keydown(function (e) {
                e = e || window.event;
                console.log(e.which);
                if(e.which == keyCode && pageId == id) {
                    callback();
                }
            });
        },

        renderBilltype: function () {
            this.$el.find('.for-billingtype').html(this.template_billingtype(this.collection.toJSON()));
            return this;
        },

    });

    return billtypeView;
});