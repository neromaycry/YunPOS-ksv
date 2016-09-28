/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/billing-return/model',
    '../../../../moduals/billing-return/collection',
    '../../../../moduals/modal-returnbillingtype/view',
    '../../../../moduals/keytips-member/view',
    '../../../../moduals/modal-confirm/view',
    '../../../../moduals/modal-brecardlogin/view',
    'text!../../../../moduals/billing-return/billinfotpl.html',
    'text!../../../../moduals/billing/billingdetailtpl.html',
    'text!../../../../moduals/main/numpadtpl.html',
    'text!../../../../moduals/billing-return/tpl.html'
], function (BaseView, BillRtModel, BillRtCollection, BilltypeView,KeyTipsView, ConfirmView,BRCardView, billinfotpl, billingdetailtpl,numpadtpl, tpl) {

    var billingRtView = BaseView.extend({

        id: "billingRtView",

        el: '.views',

        template: tpl,

        template_billinfo:billinfotpl,

        template_billingdetailtpl:billingdetailtpl,

        template_numpad:numpadtpl,

        typeList:null,

        totalamount:0,

        discoutamount:0,

        receivedsum:0,

        unpaidamount:0,

        i:0,

        input:'input[name = billingrt]',

        events: {
            'click .br-help':'onHelpClicked',
            'click .br-return':'onReturnClicked',
            'click [data-index]': 'onPayClick',
            'click .br-delete':'onDeleteClicked',
            'click .br-clean':'onCleanClicked',
            'click .br-keyup':'onKeyUpClicked',
            'click .br-keydown':'onKeyDownClicked',
            'click .billing':'onBillingClicked',
            'click .numpad-ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
        },

        pageInit: function () {
            pageId = window.PAGE_ID.BILLING_RETURN;
            this.model = new BillRtModel();
            this.collection = new BillRtCollection();
            this.typeList = new BillRtCollection();
            if(isfromForce){
                //强制退货
                this.totalamount = storage.get(system_config.FORCE_RETURN_KEY,'panel','totalamount');
                this.discoutamount = storage.get(system_config.FORCE_RETURN_KEY,'panel','discountamount');
                this.totalamount = this.totalamount - this.discoutamount;
                this.unpaidamount = this.totalamount;
                this.model.set({
                    totalamount:this.totalamount,
                    unpaidamount:this.unpaidamount
                });
            }else{
                this.totalamount = storage.get(system_config.RETURN_KEY,'panel','totalamount');
                this.unpaidamount = this.totalamount;
                console.log(this.totalamount);
                this.model.set({
                    totalamount:this.totalamount,
                    unpaidamount:this.unpaidamount
                });
            }
            this.handleEvents();
            this.initTemplates();
        },

        initPlugins: function () {
            this.renderBillInfo();
            $('.for-billdetail').perfectScrollbar();
            this.$el.find('.for-numpad').html(this.template_numpad);
            $('input[name = billingrt]').focus();
        },

        handleEvents: function () {
            Backbone.off('onReceivedsum');
            Backbone.on('onReceivedsum',this.onReceivedsum,this);
        },

        onReceivedsum: function (data) {
            console.log(data);
            var receivedsum = data['receivedsum'];
            var gatherNo = data['gather_no'];
            var gatherName = data['gather_name'];
            var gatherId = data['gather_id'];
            this.addToPaymentList(this.totalamount,gatherName,receivedsum,gatherNo,gatherId);
        },

        initTemplates: function () {
            this.template_billinfo = _.template(this.template_billinfo);
            this.template_billingdetailtpl = _.template(this.template_billingdetailtpl);
        },

        /**
         * 初始化layout中各个view的高度
         */
        initLayoutHeight: function () {
            var dh = $(document).height();
            var dw = $(window).width();
            var nav = $('.navbar').height();
            var panelheading = $('.panel-heading').height();
            var panelfooter = $('.panel-footer').height();
            var billdetail = dh - nav * 2 - panelheading * 2 - panelfooter;
            var leftWidth = $('.main-left').width();
            var cartWidth = dw - leftWidth - 45;
            $('.cart-panel').width(cartWidth);
            $('.for-billdetail').height(billdetail);
            this.listheight = $('.for-billdetail').height();
            this.listnum = 10;//设置商品列表中的条目数
            $('.li-billdetail').height(this.listheight / this.listnum - 21);
        },


        renderBillInfo: function () {
            this.$el.find('.for-billinfo').html(this.template_billinfo(this.model.toJSON()));
            return this;
        },

        renderBillDetail: function () {
            this.$el.find('.for-billdetail').html(this.template_billingdetailtpl(this.collection.toJSON()));
            $('.li-billdetail').height(this.listheight / this.listnum - 21);
            $('#billdetail' + this.i).addClass('cus-selected');
            return this;
        },

        /**
         * 向已付款列表中插入新的行
         * @param totalamount 总金额
         * @param gatherName 付款方式名称
         * @param receivedsum 付款金额
         * @param gatherAccount 付款账号
         * @param gatherId 付款方式Id
         */
        addToPaymentList: function (totalamount,gatherName,receivedsum,gatherAccount,gatherId) {
            var _self = this;
            var model = new BillRtModel();
            model.set({
                fact_money:0,
                gather_id:gatherId,
                gather_name:gatherName,
                gather_money:parseFloat(receivedsum),
                gather_no:gatherAccount
            });
            this.collection.add(model);
            var totalreceived = 0;
            var trList = this.collection.pluck('gather_money');
            console.log(trList);
            for(var i = 0;i<trList.length;i++){
                totalreceived += trList[i];
            }
            console.log('totalreceived:'+totalreceived);
            if(totalreceived >= totalamount){
                this.unpaidamount = 0;
            }else {
                this.unpaidamount = totalamount - totalreceived;
            }
            this.model.set({
                receivedsum: totalreceived,
                unpaidamount: _self.unpaidamount
            });
            this.i = 0;
            this.renderBillInfo();
            this.renderBillDetail();
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Esc, function () {
                if (isfromForce) {
                    router.navigate('returnforce',{trigger:true});
                } else {
                    router.navigate('returnwhole',{trigger:true});
                }
            });

            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Enter, function () {
                _self.confirm();
            });

            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.D, function () {
               _self.deleteItem();
            });

            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.B, function() {
                _self.doBilling();
            });

            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Down, function () {
                _self.scrollDown();
            });

            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Up, function() {
               _self.scrollUp();
            });

            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.S, function () {
               _self.payByCash();
            });

            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.A, function() {
               _self.payByGiftCard();
            });

            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.P, function() {
               _self.payByPos();
            });

            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Q, function() {
               _self.payByPos();
            });
            //一卡通支付
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.O, function () {
                _self.payByOneCard();
            });
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.T, function () {
                var tipsView = new KeyTipsView('BILLING_RETURN_PAGE');
                _self.showModal(window.PAGE_ID.TIP_MEMBER,tipsView);
            });
            //清空支付方式列表
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.C, function () {
                _self.cleanPaylist();
            });
        },

        onHelpClicked: function () {
            var _self = this;
            var tipsView = new KeyTipsView('BILLING_RETURN_PAGE');
            _self.showModal(window.PAGE_ID.TIP_MEMBER,tipsView);
        },
        onReturnClicked: function () {
            if (isfromForce) {
                router.navigate('returnforce',{trigger:true});
            } else {
                router.navigate('returnwhole',{trigger:true});
            }
        },
        /**
         * 确认事件
         */
        confirm:function(){
            var receivedsum = $('#input_billingrt').val();
            var unpaidamount = this.model.get('unpaidamount');
            if(this.model.get('unpaidamount') == 0) {
                toastr.warning('退货金额为零，请进行结算');
            }else if(receivedsum == '') {
                toastr.warning('退货金额不能为空，请重新输入');
            }else if(receivedsum == 0){
                toastr.warning('退货金额不能为零，请重新输入');
            }else if(receivedsum == '.'){
                toastr.warning('请输入有效退货金额');
            } else if(receivedsum > unpaidamount){
                toastr.warning('不设找零，请重新输入');
            }else{
                this.addToPaymentList(this.totalamount,"现金",receivedsum,"*","00");
            }
            $('#input_billingrt').val("");

        },

        payByCash: function () {
            var unpaidamount = this.model.get('unpaidamount');
            if(unpaidamount == 0){
                toastr.warning('退货金额为零,请进行结算');
            }else {
                this.billtype = new BilltypeView('00');
                this.showModal(window.PAGE_ID.RETURN_BILLING_TYPE,this.billtype);
                var attrData = {};
                attrData['unpaidamount'] = unpaidamount;//本次应收的金额
                Backbone.trigger('onunpaidamount',attrData);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = receivedsum]').focus();
                    //$('#li' + _self.i).addClass('cus-selected');
                });
            }
        },

        payByGiftCard: function () {
            var unpaidamount = this.model.get('unpaidamount');
            if(unpaidamount == 0){
                toastr.warning('退货金额为零,请进行结算');
            }else {
                this.billtype = new BilltypeView('01');
                this.showModal(window.PAGE_ID.RETURN_BILLING_TYPE,this.billtype);
                var attrData = {};
                attrData['unpaidamount'] = unpaidamount;//本次应收的金额
                Backbone.trigger('onunpaidamount',attrData);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = receivedsum]').focus();
                    //$('#li' + _self.i).addClass('cus-selected');
                });
            }
        },
        payByPos: function () {
            var unpaidamount = this.model.get('unpaidamount');
            if(unpaidamount == 0){
                toastr.warning('退货金额为零,请进行结算');
            }else {
                this.billtype = new BilltypeView('02');
                this.showModal(window.PAGE_ID.RETURN_BILLING_TYPE,this.billtype);
                var attrData = {};
                attrData['unpaidamount'] = unpaidamount;//本次应收的金额
                Backbone.trigger('onunpaidamount',attrData);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = receivedsum]').focus();
                    //$('#li' + _self.i).addClass('cus-selected');
                });
            }
        },
        payByThird: function () {
            var unpaidamount = this.model.get('unpaidamount');
            if(unpaidamount == 0){
                toastr.warning('退货金额为零,请进行结算');
            }else {
                this.billtype = new BilltypeView('03');
                this.showModal(window.PAGE_ID.RETURN_BILLING_TYPE,this.billtype);
                var attrData = {};
                attrData['unpaidamount'] = unpaidamount;//本次应收的金额
                Backbone.trigger('onunpaidamount',attrData);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = receivedsum]').focus();
                    //$('#li' + _self.i).addClass('cus-selected');
                });
            }
        },
        payByOneCard: function () {
            var unpaidamount = this.model.get('unpaidamount');
            if(unpaidamount == 0){
                toastr.warning('退货金额为零，请进行结算');
            }else{
                this.bronecardview = new BRCardView(unpaidamount);
                this.showModal(window.PAGE_ID.BR_ONECARD_LOGIN,this.bronecardview);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = medium_id]').focus();
                });
            }
        },

        deleteItem:function() {
            var _self = this;
            var item = _self.collection.at(_self.i);
            console.log(item);
            console.log(_self.collection);
            _self.collection.remove(item);
            console.log(_self.collection);
            var totalreceived = 0;
            var trlist = _self.collection.pluck('gather_money');
            for(var i = 0;i<trlist.length;i++) {
                totalreceived += trlist[i];
            }
            if(totalreceived >= _self.totalamount) {
                _self.unpaidamount = 0;
                _self.oddchange = totalreceived - _self.totalamount;
            }else{
                _self.oddchange = 0;
                _self.unpaidamount = _self.totalamount - totalreceived;
            }
            _self.model.set({
                receivedsum: totalreceived,
                unpaidamount: _self.unpaidamount,
                oddchange:_self.oddchange
            });
            _self.i = 0;
            _self.renderBillInfo();
            _self.renderBillDetail();
            toastr.success('删除成功');
        },

        cleanPaylist: function () {
            this.collection.reset();
            this.model.set({
                receivedsum:0,
                oddchange:0,
                unpaidamount:this.totalamount
            });
            this.renderBillDetail();
            this.renderBillInfo();
            toastr.success('清空支付方式列表成功');
        },

        scrollDown: function () {
            //if (this.i < this.collection.length - 1) {
            //    this.i++;
            //}
            //$('#billdetail' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');

            if (this.i < this.collection.length - 1) {
                this.i++;
            }
            if (this.i % this.listnum == 0) {
                this.n++;
                $('.for-billdetail').scrollTop(this.listheight * this.n);
            }
            $('#billdetail' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },

        scrollUp: function () {
            //if (this.i > 0) {
            //    this.i--;
            //}
            //$('#billdetail' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            if (this.i > 0) {
                this.i--;
            }
            if ((this.i+1) % this.listnum == 0 && this.i > 0) {
                this.n--;
                $('.for-billdetail').scrollTop(this.listheight * this.n );
            }
            $('#billdetail' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },

        doBilling: function () {
            var _self = this;
            //var brreceivedsum = $('input[name = billingrt]').val();
            var confirmBill = new BillRtModel();
            if(_self.unpaidamount != 0){
                toastr.warning('还有未支付的金额，请支付完成后再进行结算');
            }else{
                var confirmView = new ConfirmView({
                    pageid:window.PAGE_ID.BILLING_RETURN, //当前打开confirm模态框的页面id
                    callback: function () { //
                        _self.unpaidamount = _self.unpaidamount.toFixed(2);
                        if(isfromForce) {
                            var data = {};
                            data['mode'] = '02';
                            if (storage.isSet(system_config.VIP_KEY)) {
                                data['medium_id'] = storage.get(system_config.VIP_KEY,'medium_id');
                                data['medium_type'] = storage.get(system_config.VIP_KEY,'medium_type');
                                data['cust_id'] = storage.get(system_config.VIP_KEY,'cust_id');

                            } else {
                                data['medium_id'] = "*";
                                data['medium_type'] = "*";
                                data['cust_id'] = "*";
                            }
                            data['goods_detail'] = storage.get(system_config.FORCE_RETURN_KEY,'cartlist');
                            data['gather_detail'] = _self.collection.toJSON();
                            for(var i = 0;i<data['gather_detail'].length;i++) {
                                data['gather_detail'][i].gather_money = - data['gather_detail'][i].gather_money;
                                console.log(data['gather_detail'][i]);
                            }
                            confirmBill.trade_confirm(data, function (resp) {
                                console.log(resp);
                                if (resp.status == '00') {
                                    console.log(resp.bill_no);
                                    storage.remove(system_config.FORCE_RETURN_KEY);
                                    if (storage.isSet(system_config.VIP_KEY)) {
                                        storage.remove(system_config.VIP_KEY);
                                    }
                                    router.navigate("main", {trigger: true,replace:true});
                                    toastr.success("订单号：" + resp.bill_no);
                                } else {
                                    toastr.error(resp.msg);
                                }
                            });

                        }else {
                            var data = {};
                            data['mode'] = '02';
                            if (storage.isSet(system_config.VIP_KEY)) {
                                data['medium_id'] = storage.get(system_config.VIP_KEY,'medium_id');
                                data['medium_type'] = storage.get(system_config.VIP_KEY,'medium_type');
                                data['cust_id'] = storage.get(system_config.VIP_KEY,'cust_id');
                            } else {
                                data['medium_id'] = "*";
                                data['medium_type'] = "*";
                                data['cust_id'] = "*";
                            }
                            data['goods_detail'] = storage.get(system_config.RETURN_KEY,'cartlist');
                            data['gather_detail'] = _self.collection.toJSON();
                            for(var i = 0;i<data['gather_detail'].length;i++) {
                                data['gather_detail'][i].gather_money = - data['gather_detail'][i].gather_money;
                                console.log(data['gather_detail'][i]);
                            }
                            confirmBill.trade_confirm(data, function (resp) {
                                console.log(resp);
                                if (resp.status == '00') {
                                    console.log(resp.bill_no);
                                    storage.remove(system_config.RETURN_KEY);
                                    if (storage.isSet(system_config.VIP_KEY)) {
                                        storage.remove(system_config.VIP_KEY);
                                    }
                                    router.navigate("main", {trigger: true,replace:true});
                                    //f7app.alert('订单号：' + resp.bill_no,'提示');
                                    toastr.success('订单号：' + resp.bill_no)
                                } else {
                                    toastr.error(resp.msg);
                                }
                            });
                        }
                    },
                    content:'确定进入退货结算？'
                });
                _self.showModal(window.PAGE_ID.CONFIRM, confirmView);
            }
        },

        onPayClick:function(e) {
            var index = $(e.currentTarget).data('index');
            switch (index) {
                case '00':
                    this.payByCash();
                    break;
                case '01':
                    this.payByGiftCard();
                    break;
                case '02':
                    this.payByPos();
                    break;
                case '03':
                    this.payByThird();
                    break;
                case '04':
                    this.payByOneCard();
                    break;
            }
        },
        onDeleteClicked:function () {
            this.deleteItem();
        },
        onCleanClicked: function () {
            this.cleanPaylist();
        },
        onKeyUpClicked:function (){
            this.scrollUp();
        },
        onKeyDownClicked:function() {
            this.scrollDown();
        },
        onBillingClicked: function () {
            this.doBilling();
        },
        onOKClicked: function () {
            this.confirm();
        },

        onNumClicked: function (e) {
            var value = $(e.currentTarget).data('num');
            var str = $(this.input).val();
            str += value;
            $(this.input).val(str);
        },

        onBackspaceClicked: function () {
            var str = $(this.input).val();
            str = str.substring(0, str.length-1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },
    });

    return billingRtView;
});