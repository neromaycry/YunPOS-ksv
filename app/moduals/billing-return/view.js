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
    'text!../../../../moduals/billing-return/billinfotpl.html',
    'text!../../../../moduals/billing/billingdetailtpl.html',
    'text!../../../../moduals/billing-return/tpl.html'
], function (BaseView, BillRtModel, BillRtCollection, BilltypeView,KeyTipsView, ConfirmView, billinfotpl, billingdetailtpl, tpl) {

    var billingRtView = BaseView.extend({

        id: "billingRtView",

        el: '.views',

        template: tpl,

        template_billinfo:billinfotpl,

        template_billingdetailtpl:billingdetailtpl,

        typeList:null,

        totalamount:0,

        discoutamount:0,

        receivedsum:0,

        unpaidamount:0,

        i:0,

        input:'input[name = billingrt]',

        events: {
            'click .billing-help':'onHelpClicked',
            'click .return':'onReturnClicked',
            'click [data-index]': 'onPayClick',
            'click .returnbilling_delete':'onDeleteClicked',
            'click .returnbilling_clean':'onCleanClicked',
            'click .returnbilling_keyup':'onKeyUpClicked',
            'click .returnbilling_keydown':'onKeyDownClicked',
            'click .billing':'onBillingClicked',
            'click .btn-floatpad':'onFloatPadClicked',
            'click .main-ok':'onOKClicked',
            'click .main-btn-num':'onNumClicked',
            'click .main-btn-backspace':'onBackspaceClicked',
            'click .main-btn-clear':'onClearClicked',
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
            this.initTemplates();
        },

        initPlugins: function () {
            this.renderBillInfo();
            this.handleEvents();
            this.initLayoutHeight();
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
            var nav = $('.navbar').height();
            var panelheading = $('.panel-heading').height();
            var panelfooter = $('.panel-footer').height();
            var billdetail = dh - nav * 2 - panelheading * 3 - panelfooter;
            $('.for-billdetail').height(billdetail);
        },


        renderBillInfo: function () {
            this.$el.find('.for-billinfo').html(this.template_billinfo(this.model.toJSON()));
            return this;
        },

        renderBillDetail: function () {
            this.$el.find('.for-billdetail').html(this.template_billingdetailtpl(this.collection.toJSON()));
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
                _self.receivedsum = $('#input_billingrt').val();
                if(_self.model.get('unpaidamount') == 0) {
                    toastr.warning('待支付金额为零，请进行结算');
                }else if($('#input_billingrt').val() == '') {
                    toastr.warning('支付金额不能为空，请重新输入');
                }else if($('#input_billingrt').val() == 0){
                    toastr.warning('支付金额不能为零，请重新输入');
                }else{
                    _self.addToPaymentList(_self.totalamount,"现金",_self.receivedsum,"*","00");
                }
                $('#input_billingrt').val("");
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

        payByCash: function () {
            var unpaidamount = this.model.get('unpaidamount');
            if(unpaidamount == 0){
                toastr.warning('待支付金额为零,请进行结算');
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
                toastr.warning('待支付金额为零,请进行结算');
            }else {
                this.billtype = new BilltypeView('01');
                this.showModal(window.PAGE_ID.RETURN_BILLING_TYPE,this.billtype);
                var attrData = {};
                attrData['unpaidamount'] = this.model.get('unpaidamount');//本次应收的金额
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
                toastr.warning('待支付金额为零,请进行结算');
            }else {
                this.billtype = new BilltypeView('02');
                this.showModal(window.PAGE_ID.RETURN_BILLING_TYPE,this.billtype);
                var attrData = {};
                attrData['unpaidamount'] = this.model.get('unpaidamount');//本次应收的金额
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
                toastr.warning('待支付金额为零,请进行结算');
            }else {
                this.billtype = new BilltypeView('03');
                this.showModal(window.PAGE_ID.RETURN_BILLING_TYPE,this.billtype);
                var attrData = {};
                attrData['unpaidamount'] = _self.model.get('unpaidamount');//本次应收的金额
                Backbone.trigger('onunpaidamount',attrData);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = receivedsum]').focus();
                    //$('#li' + _self.i).addClass('cus-selected');
                });
            }
        },
        payByOneCard: function () {
            alert('一卡通支付');
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
            if (this.i < this.collection.length - 1) {
                this.i++;
            }
            $('#billdetail' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },

        scrollUp: function () {
            if (this.i > 0) {
                this.i--;
            }
            $('#billdetail' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },

        doBilling: function () {
            var _self = this;
            var confirmBill = new BillRtModel();
            if(_self.unpaidamount != 0){
                toastr.warning('还有未支付的金额，请支付完成后再进行结算');
            } else {
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
            $(e.currentTarget).addClass('cus-selected').siblings().removeClass('cus-selected');
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
        onFloatPadClicked: function () {
            var isDisplay = $('.float-numpad').css('display') == 'none';
            if (isDisplay) {
                $('.float-numpad').css('display','block');
                $('.btn-floatpad').text('关闭小键盘')
            } else {
                $('.float-numpad').css('display','none');
                $('.btn-floatpad').text('开启小键盘')
            }
        },
        onOKClicked: function () {
            var _self = this;
            _self.receivedsum = $('#input_billingrt').val();
            if(_self.model.get('unpaidamount') == 0) {
                toastr.warning('待支付金额为零，请进行结算');
            }else if($('#input_billingrt').val() == '') {
                toastr.warning('支付金额不能为空，请重新输入');
            }else if($('#input_billingrt').val() == 0){
                toastr.warning('支付金额不能为零，请重新输入');
            }else{
                _self.addToPaymentList(_self.totalamount,"现金",_self.receivedsum,"*","00");
            }
            $('#input_billingrt').val("");
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