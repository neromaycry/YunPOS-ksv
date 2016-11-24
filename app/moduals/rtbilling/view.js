/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/rtbilling/model',
    '../../../../moduals/rtbilling/collection',
    '../../../../moduals/layer-help/view',
    '../../../../moduals/layer-confirm/view',
    '../../../../moduals/layer-rtquickpay/view',
    '../../../../moduals/layer-rtgatherui/view',
    '../../../../moduals/layer-rtbilltype/view',
    '../../../../moduals/layer-ecardlogin/view',
    'text!../../../../moduals/main/numpadtpl.html',
    'text!../../../../moduals/rtbilling/billinfotpl.html',
    'text!../../../../moduals/billing/billingdetailtpl.html',
    'text!../../../../moduals/rtbilling/tpl.html'
], function (BaseView, RTBillModel, RTBillCollection, LayerHelpView,LayerConfirmView,RTQuickPayView, GatherUIView,RTLayerTypeView,layerECardView, numpadtpl,billinfotpl,billingdetailtpl, tpl) {
    var rtbillingView = BaseView.extend({

        id: "rtbillingView",

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

        card_id:'',//一卡通界面传过来的card_id

        i:0,

        input:'input[name = billingrt]',

        events: {
            'click .numpad-ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
            'click .rtbilling-help':'onHelpClicked',
            'click .rtbilling-return':'onReturnClicked',
            'click .billing-delete':'onDeleteClicked',
            'click .rtbilling-keyup':'onKeyUpClicked',
            'click .rtbilling-keydown':'onKeyDownClicked',
            'click .billing-clean':'onBillCleanClicked',
            'click .billing':'onBillingClicked',
            'click .quick-pay':'onQuickPayClicked',//快捷支付
            'click .check':'onCheckClicked',//支票类付款
            'click .gift-certificate':'onGiftClicked',//礼券类
            'click .pos':'onPosClicked',//银行pos
            'click .ecard':'onEcardClicked',
            'click .third-pay':'onThirdPayClicked'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.BILLING_RETURN;
            this.model = new RTBillModel();
            this.collection = new RTBillCollection();
            this.typeList = new RTBillCollection();
            this.handleEvents();
            this.initTemplates();
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
                this.totalamount = Math.abs(storage.get(system_config.RETURN_KEY,'panel','totalamount'));
                this.unpaidamount = this.totalamount;
                this.receivedsum = 0;
                this.model.set({
                    receivedsum:this.receivedsum,
                    totalamount:this.totalamount,
                    unpaidamount:this.unpaidamount
                });
            }
        },
        initPlugins: function () {
            var _self = this;
            this.renderBillInfo();
            this.renderBillDetail();
            $('input[name = billingrt]').focus();
            $('.for-billdetail').perfectScrollbar();
            this.$el.find('.for-numpad').html(this.template_numpad);
            this.initLayoutHeight();
        },

        /**
         * 初始化layout中各个view的高度
         */
        initLayoutHeight: function () {
            var dh = $(window).height();
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
            this.listnum = 9;//设置商品列表中的条目数
            $('.li-billdetail').height(this.listheight / this.listnum - 21);
        },

        initTemplates: function () {
            this.template_billinfo = _.template(this.template_billinfo);
            this.template_billingdetailtpl = _.template(this.template_billingdetailtpl);
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

        handleEvents: function () {
            Backbone.off('onReceivedsum');
            Backbone.on('onReceivedsum',this.onReceivedsum,this);
        },

        onReceivedsum: function (data) {
            var receivedsum = data['gather_money'];
            var gatherNo = data['gather_no'];//付款账号
            var gatherName = data['gather_name'];
            var gatherId = data['gather_id'];
            var gatherKind = data['gather_kind'];
            this.card_id = data['card_id'];
            this.addToPaymentList(this.totalamount,gatherName,parseFloat(receivedsum),gatherNo,gatherId,gatherKind,this.card_id);
        },

        bindKeys: function () {
            var _self = this;
            //返回上一层
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Esc, function () {
                _self.onReturnClicked();
            });
            //确定
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Enter, function () {
                _self.confirm();
            });
            //删除
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.D, function () {
                _self.onDeleteClicked();
            });
            //结算
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Space, function() {
                _self.onBillingClicked();
            });
            //方向下
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Down, function () {
                _self.scrollDown();
            });
            //方向上
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Up, function() {
                _self.scrollUp();
            });
            //支票类
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.S, function() {
                _self.payment('01', '支票类');
            });
            //礼券类
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.B, function() {
                _self.payment('02', '礼券类');
            });
            //银行POS
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.P, function() {
                _self.payment('03', '银行POS');
            });
            //第三方支付
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Q, function () {
                $('input[name = billingrt]').val('');
                layer.msg('该功能正在调试中', optLayerHelp);
                //_self.payment('05', '第三方支付');
            });
            //帮助
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.T, function () {
                _self.openHelp();
            });
            //一卡通支付快捷键
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.O, function () {
                _self.payByECard();
            });
            //清空支付方式列表
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.C, function () {
                _self.onBillCleanClicked();
            });
            //快捷支付
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.E, function () {
                _self.QuickPay();
            });

        },

        /**
         *向已付款列表中插入新的行
         * @param totalamount 总金额
         * @param gatherName 付款方式名称
         * @param receivedsum 付款金额
         * @param gatherAccount 付款账号
         * @param gatherId 付款方式Id
         * @param gatherKind 付款方式类别
         * @param cardId 一卡通付款卡号
         */
        addToPaymentList: function (totalamount, gatherName, receivedsum, gatherAccount, gatherId, gatherKind, cardId) {
            var temp = this.collection.findWhere({gather_id: gatherId, gather_no:gatherAccount});
            var model = new RTBillModel();
            if(temp != undefined) {
                model = temp;
                var gather_money = model.get('gather_money');
                receivedsum = parseFloat(gather_money) + receivedsum;
            }
            model.set({
                fact_money:0,
                gather_id:gatherId,
                gather_name:gatherName,
                gather_money:receivedsum,
                gather_no:gatherAccount,
                gather_kind:gatherKind,
                card_id:cardId,
                havepay_money:receivedsum,
                payment_bill:'',
                change_money:0
            });
            this.collection.push(model);
            var totalreceived = 0;
            var trList = this.collection.pluck('gather_money');
            console.log(trList);
            for(var i = 0;i<trList.length;i++){
                totalreceived += trList[i];
            }
            console.log('totalreceived:'+totalreceived);
            console.log(totalamount + 'this is totalamount');
            if(totalreceived >= totalamount){
                this.unpaidamount = 0;
                this.oddchange = totalreceived - totalamount;
            }else{
                this.oddchange = 0;
                this.unpaidamount = totalamount - totalreceived;
            }
            this.model.set({
                receivedsum: totalreceived,
                unpaidamount: this.unpaidamount,
                oddchange:this.oddchange
            });
            this.renderBillInfo();
            this.renderBillDetail();
        },

        openHelp: function () {
            var attrs = {
                page:'BILLING_RETURN_PAGE'
            };
            this.openLayer(PAGE_ID.LAYER_HELP, pageId, '帮助', LayerHelpView, attrs, {area:'600px'});
        },

        /**
         * 确认事件
         */
        confirm:function(){
            var receivedsum = $(this.input).val();
            var unpaidamount = Math.abs(this.model.get('unpaidamount'));
            if(unpaidamount == 0) {
                layer.msg('退货金额为零，请进行结算', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if(receivedsum == '.' || (receivedsum.split('.').length-1) > 1 || parseFloat(receivedsum) == 0) {
                layer.msg('无效的退货金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if(receivedsum == '') {
                receivedsum = unpaidamount;
            }
            if(receivedsum > unpaidamount){
                layer.msg('不设找零', optLayerWarning);
                $(this.input).val('');
                return;
            }
            //this.i = 0;
            this.addToPaymentList(this.totalamount,"现金",parseFloat(receivedsum),"*","00","00",this.card_id);
            $(this.input).val("");
        },


        /**
         * 光标向下
         */
        scrollDown: function () {
            if (this.i < this.collection.length - 1) {
                this.i++;
            }
            if (this.i % this.listnum == 0 && this.n < parseInt(this.collection.length / this.listnum)) {
                this.n++;
                $('.for-billdetail').scrollTop(this.listheight * this.n);
            }
            $('#billdetail' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },

        /**
         * 光标向上
         */
        scrollUp: function () {
            if (this.i > 0) {
                this.i--;
            }
            if ((this.i+1) % this.listnum == 0 && this.i > 0) {
                this.n--;
                $('.for-billdetail').scrollTop(this.listheight * this.n );
            }
            $('#billdetail' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },



        /**
         * 清空已支付列表
         */
        cleanPaylist: function () {
            this.receivedsum = 0;
            this.oddchange = 0;
            this.collection.reset();
            this.model.set({
                receivedsum:this.receivedsum,
                oddchange:this.oddchange,
                unpaidamount:this.totalamount
            });
            storage.remove(system_config.ONE_CARD_KEY);
            this.renderBillDetail();
            this.renderBillInfo();
            layer.msg('清空退款方式列表成功', optLayerSuccess);
        },
        /**
         * 结算
         */
        doBilling: function () {
            var _self = this;
            var unpaidamount = this.model.get('unpaidamount');
            var confirmBill = new RTBillModel();
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
                for(var i = 0;i < data['gather_detail'].length;i++) {
                    data['gather_detail'][i].gather_money = - data['gather_detail'][i].gather_money;
                    data['gather_detail'][i].havepay_money = - data['gather_detail'][i].havepay_money;
                }
                for(var i = 0;i < data['goods_detail'].length;i++) {
                    data['goods_detail'][i].money = -data['goods_detail'][i].money;
                    data['goods_detail'][i].num = -data['goods_detail'][i].num;
                    data['goods_detail'][i].discount = -data['goods_detail'][i].discount;
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
                        layer.msg("订单号：" + resp.bill_no, optLayerSuccess);
                    } else {
                        layer.msg(resp.msg, optLayerError);
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
                    data['gather_detail'][i].havepay_money = - data['gather_detail'][i].havepay_money;
                    console.log(data['gather_detail'][i]);
                }
                for(var i = 0;i < data['goods_detail'].length;i++) {
                    data['goods_detail'][i].money = -data['goods_detail'][i].money;
                    data['goods_detail'][i].num = -data['goods_detail'][i].num;
                    data['goods_detail'][i].discount = -data['goods_detail'][i].discount;
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
                        layer.msg("订单号：" + resp.bill_no, optLayerSuccess);
                    } else {
                        layer.msg(resp.msg, optLayerError);
                    }
                });
            }
        },
        /**
         * 快捷支付
         */
        QuickPay: function () {
            var _self = this;
            var gatherId = $(this.input).val();
            var unpaidamount = this.model.get('unpaidamount');
            if(unpaidamount == 0){
                layer.msg('待支付金额为零,请进行结算', optLayerWarning);
                return;
            }
            if(gatherId == '') {
                layer.msg('无效的付款编码', optLayerWarning);
                return;
            }
            if(storage.isSet(system_config.GATHER_KEY)){
                var tlist = storage.get(system_config.GATHER_KEY);
                var visibleTypes = _.where(tlist,{visible_flag:'1'});
                var gatheridlist = _.pluck(visibleTypes, 'gather_id');
                var result = $.inArray(gatherId,gatheridlist);
                if(result == - 1){
                    layer.msg('无效的付款编码', optLayerWarning);
                    return;
                }
                var item = _.findWhere(visibleTypes, {gather_id:gatherId});
                var data = {};
                var xfbdata = {};
                xfbdata['pos_id'] = '002';
                xfbdata['bill_no'] = _self.billNumber;
                data['gather_money'] = unpaidamount;
                data['gather_id'] = gatherId;
                data['gather_name'] = item.gather_name;
                switch(gatherId) {
                    case '12':
                       layer.msg('该功能正在调试中', optLayerHelp);
                        //this.openLayer(PAGE_ID.LAYER_RT_QUICKPAY, pageId, item.gather_name,RTQuickPayView , data, {area:'300px'});
                        break;
                    case '13':
                        layer.msg('该功能正在调试中', optLayerHelp);
                        //this.openLayer(PAGE_ID.LAYER_RT_QUICKPAY, pageId, item.gather_name,RTQuickPayView , data, {area:'300px'});
                        break;
                    default :
                        data['payment_bill'] = '';
                        this.openLayer(PAGE_ID.LAYER_RT_QUICKPAY, pageId, item.gather_name,RTQuickPayView , data, {area:'300px'});
                }
            }
            $(this.input).val('');
        },

        /**
         *点击支付大类按钮的点击事件
         */
        payment:function (gatherkind, title){
            var data = {};
            data['gather_kind'] = gatherkind;
            var receivedsum = $(this.input).val();
            var unpaidamount = this.model.get('unpaidamount');
            if(unpaidamount == 0){
                layer.msg('待退款金额为零,请进行退款', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if(parseFloat(receivedsum) == 0 || receivedsum == '.' || (receivedsum.split('.').length-1) > 1){
                layer.msg('无效的退款金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if(receivedsum > unpaidamount){
                layer.msg('不设找零', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if(receivedsum == '') {
                data['gather_money'] = unpaidamount;
            }else{
                data['gather_money'] = receivedsum;
            }
            $(this.input).val('');
            this.openLayer(PAGE_ID.LAYER_RT_BILLTYPE, pageId, title, RTLayerTypeView, data, {area:'300px'});
        },

        /**
         * 一卡通支付
         */
        payByECard: function () {
            var data = {};
            var unpaidamount = this.model.get('unpaidamount');
            var receivedSum = $(this.input).val();
            if(unpaidamount == 0){
                layer.msg('待退款金额为零,请进行退款', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if(receivedSum == '.' || parseFloat(receivedSum) == 0){
                layer.msg('无效的退款金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if(receivedSum > unpaidamount){
                layer.msg('不设找零', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if(receivedSum == '') {
                data['gather_money'] = unpaidamount;
            }else {
                data['gather_money'] = receivedSum;
            }

            data['unpaidamount'] = unpaidamount;
            data['isfromForce'] = isfromForce;
            this.openLayer(PAGE_ID.LAYER_ECARD_LOGIN, pageId, '一卡通登录', layerECardView, data, {area:'600px'});
            $(this.input).val('');
        },

        /**
         * 帮助按钮点击事件
         */
        onHelpClicked: function () {
            this.openHelp();
        },

        onReturnClicked: function () {
            if (isfromForce) {
                router.navigate('returnforce',{trigger:true});
            } else {
                router.navigate('returnwhole',{trigger:true});
            }
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

        /**
         * 删除,如果存在第三方支付，则调用refund函数;如果存在一卡通支付，调用一卡通删除函数;如果存在银行卡支付，则调用银行卡删除函数。
         * 否则，调用deleteItem
         */
        onDeleteClicked: function () {
            var _self = this;
            var len = this.collection.length;
            if(len == 0) {
                layer.msg('尚未退款', optLayerWarning);
                return;
            }
            var attrs = {
                pageid:pageId,
                content:'确定删除此条支付记录？',
                callback: function () {
                    _self.deleteItem();
                }
            };
           this.openConfirmLayer(PAGE_ID.LAYER_CONFIRM, pageId, LayerConfirmView, attrs, {area:'300px'});
        },

        deleteItem:function(){
            var item = this.collection.at(this.i);
            this.collection.remove(item);
            var totalreceived = 0;
            var trlist = this.collection.pluck('gather_money');
            for(var i = 0;i < trlist.length; i++) {
                totalreceived += trlist[i];
            }
            if(totalreceived >= this.totalamount) {
                this.unpaidamount = 0;
                this.oddchange = totalreceived - this.totalamount;
            }else{
                this.oddchange = 0;
                this.unpaidamount = this.totalamount - totalreceived;
            }
            this.model.set({
                receivedsum: totalreceived,
                unpaidamount: this.unpaidamount,
                oddchange:this.oddchange
            });
            this.i = 0;
            this.renderBillInfo();
            this.renderBillDetail();
            layer.msg('删除成功', optLayerSuccess);
        },

        /**
         * 清空支付方式列表
         */
        onBillCleanClicked: function () {
            var _self = this;
            var len = this.collection.length;
            if(len == 0) {
                layer.msg('尚未退款', optLayerWarning);
                return;
            }
            var attrs = {
                pageid:pageId,
                content:'确认清空退款列表？',
                callback: function () {
                    _self.cleanPaylist();
                }
            };
            this.openConfirmLayer(PAGE_ID.LAYER_CONFIRM, pageId, LayerConfirmView, attrs, {area:'300px'});
        },

        /**
         * 向上按钮点击事件
         */
        onKeyUpClicked: function () {
            this.scrollUp();
        },
        /**
         * 向下按钮点击事件
         */
        onKeyDownClicked: function () {
            this.scrollDown();
        },


        /**
         * 结算按钮点击事件
         */
        onBillingClicked: function () {
            var _self = this;
            var unpaidamount = this.model.get('unpaidamount');
            if(unpaidamount != 0) {
                layer.msg('还有未退款的金额', optLayerWarning);
                return;
            }
            var attrs = {
                pageid:pageId,
                content:'确定进行退货结算？',
                is_navigate:true,
                navigate_page:PAGE_ID.MAIN,
                callback: function () {
                   _self.doBilling();
               }
           };
            this.openConfirmLayer(PAGE_ID.LAYER_CONFIRM, pageId, LayerConfirmView, attrs, {area:'300px'});
        },

        /**
         * 快捷支付按钮的点击事件
         */
        onQuickPayClicked: function () {
            this.QuickPay();
        },

        /**
         *支票类付款
         */
        onCheckClicked:function () {
            this.payment('01', '支票类');
            $('button[name = check]').blur();
        },
        /**
         * 礼券
         */
        onGiftClicked: function () {
            this.payment('02', '礼券类');
            $('button[name = gift-certificate]').blur();
        },
        onPosClicked:function () {
            this.payment('03', '银行POS');
            $('button[name = pos]').blur();
        },
        /**
         * 一卡通支付按钮点击事件
         */
        onEcardClicked: function () {
            this.payByECard();
        },

        onThirdPayClicked: function () {
            layer.msg('该功能正在调试中',optLayerHelp);
            $('input[name = billingrt]').val('');
            //this.payment('05', '第三方支付');
            //$('button[name = third-pay]').blur();
        },



    });
    return rtbillingView;
});