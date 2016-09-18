/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-billingtype/model',
    '../../moduals/modal-billingtype/collection',
    '../../moduals/modal-billingaccount/view',
    'text!../../moduals/modal-billingtype/billingtypetpl.html',
    'text!../../moduals/modal-billingtype/tpl.html',
], function (BaseModalView,BilltypeModel,BilltypeCollection,BillaccountView,billingtypetpl, tpl) {

    var billtypeView = BaseModalView.extend({

        id: "billtypeView",

        template: tpl,

        template_billingtype:billingtypetpl,

        i:0,

        modalInitPage: function () {
            console.log(this.attrs);
            if(storage.isSet(system_config.GATHER_KEY)) {
                this.collection = new BilltypeCollection();
                var tlist = storage.get(system_config.GATHER_KEY);
                var visibleTypes = _.where(tlist,{visible_flag:'1'});
                if(this.attrs != '00'){
                    var gathertype = _.where(visibleTypes,{gather_type:this.attrs});
                    console.log(gathertype);
                    this.collection.set(gathertype);
                }else {
                    var gathertype = _.where(visibleTypes,{gather_type:this.attrs});
                    for(var i = 1;i < gathertype.length;i++){
                        this.collection.push(gathertype[i]);
                    }
                    console.log(this.collection);
                }
            }
            this.initTemplates();
            this.handleEvents();
        },

        initTemplates: function () {
            this.template_billingtype = _.template(this.template_billingtype);
        },

        handleEvents: function () {
            Backbone.off('onunpaidamount');
            Backbone.on('onunpaidamount',this.onunpaidamount,this);
        },

        onunpaidamount: function (data) {
            this.model = new BilltypeModel();
            this.model.set({
                unpaidamount:data['unpaidamount']
            });
            this.render();
            this.renderBilltype();
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.BILLING_TYPE, window.KEYS.Esc , function () {
                _self.hideModal(window.PAGE_ID.BILLING);
            });
            this.bindModalKeyEvents(window.PAGE_ID.BILLING_TYPE, window.KEYS.Down, function() {
                if (_self.i < _self.collection.length - 1) {
                    _self.i++;
                }
                $('#li' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            });

            this.bindModalKeyEvents(window.PAGE_ID.BILLING_TYPE, window.KEYS.Up, function() {
                if (_self.i > 0) {
                    _self.i--;
                }
                $('#li' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            });

            this.bindModalKeyEvents(window.PAGE_ID.BILLING_TYPE, window.KEYS.Enter, function() {
                var receivedsum = $('#receivedsum').val();
                if(receivedsum == '') {
                    toastr.warning('您输入的支付金额为空，请重新输入');
                }else if(receivedsum == 0) {
                    toastr.warning('支付金额不能为零，请重新输入');
                }else {
                    var attrData = {};
                    attrData['gather_id'] = _self.collection.at(_self.i).get('gather_id');
                    attrData['gather_name'] = _self.collection.at(_self.i).get('gather_name');
                    attrData['receivedsum'] = receivedsum;
                    $(".modal-backdrop").remove();
                    _self.hideModal(window.PAGE_ID.BILLING);
                    this.billaccountview = new BillaccountView(attrData);
                    _self.showModal(window.PAGE_ID.BILLING_ACCOUNT,_self.billaccountview);
                    $('.modal').on('shown.bs.modal',function(e) {
                        $('input[name = receive_account]').focus();
                    });
                }
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