/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/return-force/model',
    '../../../../moduals/return-force/collection',
    '../../../../moduals/keytips-member/view',
    '../../../../moduals/modal-confirm/view',
    '../../../../moduals/modal-login/view',
    'text!../../../../moduals/return-force/posinfotpl.html',
    'text!../../../../moduals/return-force/cartlisttpl.html',
    'text!../../../../moduals/return-force/numpadtpl.html',
    'text!../../../../moduals/return-force/tpl.html',
], function (BaseView, ReturnForceModel, ReturnForceCollection,KeyTipsView,ConfirmView,SecondLoginView, posinfotpl,cartlisttpl,numpadtpl, tpl) {

    var returnForceView = BaseView.extend({

        id: "returnForceView",

        el: '.views',

        template: tpl,

        totalamount: 0,

        itemamount: 0,

        discountamount: 0,

        i: 0,

        isDeleteKey:false,

        deleteKey:{},

        input: 'input[name = sku_id]',

        template_posinfo:posinfotpl,

        template_cartlisttpl:cartlisttpl,

        template_numpad:numpadtpl,


        events: {
            'click .numpad-ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
            'click .rt-billing':'onBillingClicked',
            'click .rt-cancel':'onCancelClicked',
            'click .rt-discount':'onDiscountClicked',
            'click .rt-delete':'onDeleteClicked',
            'click .rt-modify-num':'onModifyNumClicked',
            'click .rt-keyup':'onKeyUpClicked',
            'click .rt-keydown':'onKeyDownClicked',
            'click .rt-help':'onHelpClicked',
            'click .rt-return':'onReturnClicked',
            'click .rt-discountpercent':'onDiscountPercentClicked'
        },

        pageInit: function () {
            var _self = this;
            pageId = window.PAGE_ID.RETURN_FORCE;
            var user = storage.get(system_config.LOGIN_USER_KEY);
            this.model = new ReturnForceModel();
            this.collection = new ReturnForceCollection();
            this.requestModel = new ReturnForceModel();
            this.model.set({
                totalamount: this.totalamount,
                itemamount: this.itemamount,
                discountamount: this.discountamount
            });
            if (storage.isSet(system_config.FORCE_RETURN_KEY)) {
                _self.collection.set(storage.get(system_config.FORCE_RETURN_KEY,'cartlist'));
                _self.model.set(storage.get(system_config.FORCE_RETURN_KEY,'panel'));
            }
            if(storage.isSet(system_config.LOGIN_USER_KEY)){
                this.deleteKey = _.pluck(storage.get(system_config.LOGIN_USER_KEY,'worker_position'), 'key');
            }
            this.onDeleteKey();
            this.initTemplates();
        },

        initPlugins: function () {
            $(this.input).focus();
            $('input[name = sku_id]').focus();
            //this.initLayoutHeight();
            //$('#li' + _self.i).addClass('cus-selected');
            $('.for-cartlist').perfectScrollbar();
            this.$el.find('.for-numpad').html(this.template_numpad);
            this.renderPosInfo();
            this.renderCartList();
        },

        initTemplates: function () {
            this.template_posinfo = _.template(this.template_posinfo);
            this.template_cartlisttpl = _.template(this.template_cartlisttpl);
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
            var cart = dh - nav * 2 - panelheading * 2 - panelfooter;
            var leftWidth = $('.main-left').width();
            var cartWidth = dw - leftWidth - 45;
            $('.cart-panel').width(cartWidth);
            $('.for-cartlist').height(cart);
            this.listheight = $('.for-cartlist').height();//购物车列表的高度
            this.listnum = 6;//设置商品列表中的条目数
            $('.li-cartlist').height(this.listheight / this.listnum - 21);
        },
        renderPosInfo: function () {
            this.$el.find('.for-posinfo').html(this.template_posinfo(this.model.toJSON()));
            return this;
        },

        renderCartList: function() {
            this.$el.find('.for-cartlist').html(this.template_cartlisttpl(this.collection.toJSON()));
            $('.li-cartlist').height(this.listheight / this.listnum - 21);
            $('#li' + this.i).addClass('cus-selected');
            return this;
        },


        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.Enter, function () {
                _self.searchGoods();
            });
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.Esc,function () {
                router.navigate('main',{trigger:true});
            });
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.B,function () {
                _self.doBilling();
            });
            //取消退货
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.C, function() {
                _self.cancelForceReturn();
            });
            //删除商品
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.D,function () {
                //if(_self.isDeleteKey){
                //    _self.deleteItem();
                //}else{
                    var secondLoginView = new SecondLoginView({
                        pageid: window.PAGE_ID.RETURN_FORCE,
                        callback: function () {
                            _self.deleteItem();
                        }
                    });
                    _self.showModal(window.PAGE_ID.SECONDLOGIN, secondLoginView);
                //}
            });
            //修改数量
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.N,function () {
                _self.modifyItemNum();
            });
            //单品优惠
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.Y,function () {
               _self.modifyItemDiscount();
            });
            //单品折扣
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.U, function () {
                _self.onDiscountPercentClicked();
            });

            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.Down, function () {
               _self.scrollDown();
            });

            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.Up, function () {
               _self.scrollUp();
            });

            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.T, function () {
                var tipsView = new KeyTipsView('RETURNFORCE_PAGE');
                _self.showModal(window.PAGE_ID.TIP_MEMBER,tipsView);
            });
        },

        /**
         * 购物车光标向下
         */
        scrollDown: function () {
            if (this.i < this.collection.length - 1) {
                this.i++;
            }
            if (this.i % this.listnum == 0 && this.n < parseInt(this.collection.length / this.listnum)) {
                this.n++;
                //alert(_self.n);
                $('.for-cartlist').scrollTop(this.listheight * this.n);
            }
            $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },

        /**
         * 购物车光标向上
         */
        scrollUp: function () {
            if (this.i > 0) {
                this.i--;
            }
            if ((this.i+1) % this.listnum == 0 && this.i > 0) {
                this.n--;
                //alert(_self.n);
                $('.for-cartlist').scrollTop(this.listheight * this.n );
            }
            $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },
        /**
         * 单品删除
         */
        deleteItem: function () {
            if($('li').hasClass('cus-selected')){
                var item = this.collection.at(this.i);
                this.collection.remove(item);
                this.i = 0;
                this.renderCartList();
                this.calculateModel();
            }
            toastr.success('删除成功');
        },
        /**
         *取消退货
         */
        cancelForceReturn: function () {
            var _self = this;
            var confirmView = new ConfirmView({
                pageid:window.PAGE_ID.RETURN_FORCE, //当前打开confirm模态框的页面id
                callback: function () { //
                    _self.collection.reset();
                    _self.model.set({
                        totalamount: 0,
                        itemamount: 0,
                        discountamount: 0
                    });
                    _self.renderPosInfo();
                    _self.renderCartList();
                    storage.remove(system_config.FORCE_RETURN_KEY);
                    toastr.success('取消退货成功');
                },
                content:'确定取消退货？'
            });
            _self.showModal(window.PAGE_ID.CONFIRM, confirmView);
        },

        onAddItem: function (JSONData) {
            this.collection.set(JSONData, {merge: false});
            this.insertSerial();
            this.calculateModel();
        },
        /**
         * 查找商品
         */
        searchGoods:function (){
            var _self = this;
            search = $('#sku_id').val();
            if(search == ''){
                toastr.warning('您输入的商品编码为空，请重新输入');
            }else{
                var data = {};
                data['skucode'] = search;
                if(storage.isSet(system_config.VIP_KEY)) {
                    data['cust_id'] = storage.get(system_config.VIP_KEY,'cust_id');
                    data['medium_id'] = storage.get(system_config.VIP_KEY,'medium_id');
                    data['medium_type'] = storage.get(system_config.VIP_KEY,'medium_type');
                }else{
                    data['cust_id'] = '*';
                    data['medium_id'] = '*';
                    data['medium_type'] = '*';
                }
                data['goods_detail'] = JSON.stringify(_self.collection);
                _self.requestModel.sku(data , function(resp) {
                    if(resp.status == '00') {
                        _self.onAddItem(resp.goods_detail);
                    }else{
                        toastr.warning(resp.msg);
                    }
                });
                $('#sku_id').val('');
                _self.i = 0;
            }
        },
        /**
         * 结算
         */
        doBilling: function () {
            var itemamount = this.model.get('itemamount');
            if (itemamount == 0) {
                toastr.info('请添加要退货的商品');
            } else {
                isfromForce = true;
                router.navigate('billingreturn',{trigger:true});
            }
        },
        /**
         * 单品优惠
         */
        modifyItemDiscount: function () {
            var value = $('#sku_id').val();
            if(value == '') {
                toastr.warning('优惠金额不能为空');
            }else if(value == '.' || (value.split('.').length - 1) > 1){
                toastr.warning('请输入有效的优惠金额');
            }else {
                var item = this.collection.at(this.i);
                var price = item.get('price');
                var num = item.get('num');
                var discount = item.get('discount');
                if (value <= parseFloat(price * num - discount) ) {
                    this.collection.at(this.i).set({
                        discount: value,
                        money:price * num - value
                    });
                    this.calculateModel();
                    $('#li' + this.i).addClass('cus-selected');

                }else {
                    toastr.warning('优惠金额不能大于商品金额');
                }
            }
            $('#sku_id').val('');
        },


        //切换优惠模式
        onDiscountPercentClicked: function () {
            var discountpercent = $(this.input).val();
            if(this.model.get('itemamount') == 0) {
                toastr.warning('当前购物车内无商品');
            }else if(discountpercent == '') {
                toastr.warning('折扣比率不能为空');
            }else if(discountpercent >= 100) {
                toastr.warning('折扣比率不能大于100');
            }else if((discountpercent.split('.').length - 1) > 0){
                toastr.warning('请输入有效的折扣比率');
            }else {
                var rate = discountpercent / 100;
                console.log(rate);
                var item = this.collection.at(this.i);
                var price = item.get('price');
                var num = item.get('num');
                this.collection.at(this.i).set({
                    discount:price * num * (1 - rate),
                    money:price * num * rate
                });
                this.calculateModel();
                $('#li' + this.i).addClass('cus-selected');
            }
            $(this.input).val('');
        },
        /**
         * 修改数量
         */
        modifyItemNum: function () {
            var _self = this;
            var number = $('#sku_id').val();
            if(number == ''){
                toastr.warning('您未输入任何数量，请重新输入');
            }else if (number == 0) {
                toastr.warning('输入的数量不能为零，请重新输入');
            }else if((number.split('.').length - 1) > 0) {
                toastr.warning('请输入有效的数量');
            } else {
                var item = _self.collection.at(_self.i);
                var num = item.get('num');
                var discount = item.get('discount');
                var price = item.get('price');
                item.set({
                    num:parseFloat(number),
                    money:price * number - discount
                });
                console.log(_self.collection);
                _self.totalamount = 0;
                _self.itemamount = 0;
                _self.discountamount = 0;
                var priceList = _self.collection.pluck('price');
                var discounts = _self.collection.pluck('discount');
                var itemNum = _self.collection.pluck('num');
                for (var i = 0; i < priceList.length; i++) {
                    discounts[i] = parseFloat(discounts[i]);
                    _self.totalamount += priceList[i] * itemNum[i];
                    _self.itemamount += itemNum[i];
                    _self.discountamount += discounts[i] * itemNum[i];
                }
                _self.calculateModel();
            }
            $('#sku_id').val('');
            console.log(_self.i);
            $('#li' + _self.i).addClass('cus-selected');
        },
        /**
         * 每次添加商品时，向新添加的商品插入serial属性值
         */
        insertSerial: function () {
            for (var i = 0; i < this.collection.length; i++) {
                this.collection.at(i).set({
                    serial: i + 1
                });
            }
        },

        /**
         * 购物车中商品变更后执行的通用方法，主要是在更新后collection中重新计算总计、件数和优惠
         */
        calculateModel: function () {
            this.totalamount = 0;
            this.itemamount = 0;
            this.discountamount = 0;
            var priceList = this.collection.pluck('price');
            var itemNum = this.collection.pluck('num');
            var discounts = this.collection.pluck('discount');
            for (var i = 0; i < this.collection.length; i++) {
                discounts[i] = parseFloat(discounts[i]);
                this.totalamount += priceList[i] * itemNum[i];
                this.itemamount += itemNum[i];
                this.discountamount += discounts[i];
            }
            this.renderCartList();
            this.updateShopInfo();
            storage.set(system_config.FORCE_RETURN_KEY, 'cartlist', this.collection.toJSON());
            storage.set(system_config.FORCE_RETURN_KEY, 'panel', this.model.toJSON());

        },

        /**
         * 更新当前销售详情
         */
        updateShopInfo: function () {
            this.model.set({
                totalamount: this.totalamount,
                itemamount: this.itemamount,
                discountamount: this.discountamount
            });
            this.renderPosInfo();
        },

        /**
         * 判断当前营业员是否有删除商品的权限
         */
        onDeleteKey: function () {
            for(var j = 0; j < this.deleteKey.length; j++){
                console.log(this.deleteKey[j]);
                if(this.deleteKey[j] == '02'){
                    this.isDeleteKey = true;//判断当前是否有删除权限的key
                    break;
                }else{
                    this.isDeleteKey = false;
                }
            }
        },
        onOKClicked:function (){
            this.searchGoods();
        },
        onNumClicked: function (e) {
            var value = $(e.currentTarget).data('num');
            var str = $(this.input).val();
            str += value;
            $(this.input).val(str);
        },
        onBackspaceClicked: function (e) {
            var str = $(this.input).val();
            str = str.substring(0, str.length-1);
            $(this.input).val(str);
        },
        onClearClicked: function () {
            $(this.input).val('');
        },
        onBillingClicked: function () {
            this.doBilling();
        },
        onCancelClicked: function () {
            this.cancelForceReturn();
        },
        onDiscountClicked: function () {
            this.modifyItemDiscount();
        },
        onDeleteClicked:function (){
            var _self = this;
            //if(_self.isDeleteKey){
            //    _self.deleteItem();
            //}else{
            var secondLoginView = new SecondLoginView({
                pageid: window.PAGE_ID.RETURN_FORCE,
                callback: function () {
                    _self.deleteItem();
                }
            });
            this.showModal(window.PAGE_ID.SECONDLOGIN, secondLoginView);
            //}
        },
        onModifyNumClicked: function () {
            this.modifyItemNum();
        },

        onKeyUpClicked:function (){
            this.scrollUp();
        },
        onKeyDownClicked: function () {
            this.scrollDown();
        },
        onHelpClicked:function (){
            var tipsView = new KeyTipsView('RETURNFORCE_PAGE');
            this.showModal(window.PAGE_ID.TIP_MEMBER,tipsView);
        },
        onReturnClicked: function () {
            router.navigate('main',{trigger:true});
        },

    });

    return returnForceView;
});