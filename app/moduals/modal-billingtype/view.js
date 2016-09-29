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

        //input: 'input[name = gather-no]',

        events:{
            //'click .cancel':'onCancelClicked',
            //'click .ok':'onOkClicked',
            //'click .btn-num':'onNumClicked',
            //'click .btn-backspace':'onBackspaceClicked',
            //'click .btn-clear':'onClearClicked',
            'click .keyup':'onKeyUp',
            'click .keydown':'onKeyDown'
        },

        modalInitPage: function () {
            var _self = this;
            var gatherKind = _self.attrs['gather_kind'];
            if(storage.isSet(system_config.GATHER_KEY)) {
                this.collection = new BilltypeCollection();
                var tlist = storage.get(system_config.GATHER_KEY);
                var visibleTypes = _.where(tlist,{visible_flag:'1'});
                var gatherList = _.where(visibleTypes,{gather_kind:gatherKind});
                for(var i in gatherList){
                    var item = new BilltypeModel();
                    item.set({
                        gather_id:gatherList[i].gather_id,
                        gather_name:gatherList[i].gather_name
                    });
                   this.collection.push(item);
                }
            }
            this.initTemplates();
            this.model = new BilltypeModel();
            this.model.set({
                receivedsum:this.attrs['receivedsum']
            });
            this.render();
            this.renderBilltype();
        },

        initTemplates: function () {
            this.template_billingtype = _.template(this.template_billingtype);
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.BILLING_TYPE, window.KEYS.Esc , function () {
                _self.hideModal(window.PAGE_ID.BILLING);
                $('input[name = billing]').focus();
            });
            this.bindModalKeyEvents(window.PAGE_ID.BILLING_TYPE, window.KEYS.Down, function() {
               _self.scrollDown();
            });
            this.bindModalKeyEvents(window.PAGE_ID.BILLING_TYPE, window.KEYS.Up, function() {
               _self.scrollUp();
            });

            this.bindModalKeyEvents(window.PAGE_ID.BILLING_TYPE, window.KEYS.Enter, function() {
                _self.onReceived();
            });
        },

        //bindModalKeyEvents: function (id,keyCode,callback) {
        //    $(document).keydown(function (e) {
        //        e = e || window.event;
        //        console.log(e.which);
        //        if(e.which == keyCode && pageId == id) {
        //            callback();
        //        }
        //    });
        //},

        /**
         * Enter和确定
         */
        onReceived:function() {
            //var gatherNo = $('input[name = gather-no]').val();
            //if(gatherNo == '') {
            //    toastr.warning('账号不能为空');
            //}else{
            var attrData = {};
            attrData['gather_id'] = this.collection.at(this.i).get('gather_id');
            attrData['gather_name'] = this.collection.at(this.i).get('gather_name');
            //attrData['gather_no'] = gatherNo;
            attrData['receivedsum'] = this.attrs['receivedsum'];
            ////Backbone.trigger('onReceivedsum',attrData);
            $('.modal-backdrop').remove();
            this.hideModal(window.PAGE_ID.BILLING);
            this.billaccountview = new BillaccountView(attrData);
            this.showModal(window.PAGE_ID.BILLING_ACCOUNT,this.billaccountview);
            $('.modal').on('shown.bs.modal',function(e) {
                $('input[name = receive_account]').focus();
            });
        },

        //onOkClicked:function(){
        //  this.onReceived();
        //},
        /**
         * 方向下
         */
        scrollDown: function () {
            if (this.i < this.collection.length - 1) {
                this.i++;
            }
            $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },
        /**
         * 方向上
         */
        scrollUp:function () {
            if (this.i > 0) {
                this.i--;
            }

            $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },

        renderBilltype: function () {
            this.$el.find('.for-billingtype').html(this.template_billingtype(this.collection.toJSON()));
            $('#li' + this.i).addClass('cus-selected');
            return this;
        },

        //onCancelClicked: function () {
        //    this.hideModal(window.PAGE_ID.BILLING);
        //},
        //
        //onNumClicked: function (e) {
        //    var value = $(e.currentTarget).data('num');
        //    var str = $(this.input).val();
        //    str += value;
        //    $(this.input).val(str);
        //},

        //onBackspaceClicked: function (e) {
        //    var str = $(this.input).val();
        //    str = str.substring(0, str.length-1);
        //    $(this.input).val(str);
        //},

        //onClearClicked: function () {
        //    $(this.input).val('');
        //},

        //onKeyUp: function () {
        //    this.scrollUp();
        //},
        //
        //onKeyDown: function () {
        //    this.scrollDown();
        //}

    });

    return billtypeView;
});