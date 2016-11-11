/**
 * Created by xuying on 2016/11/7.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/print/model',
    '../../../../moduals/print/collection',
    '../../../../moduals/keytips-member/view',
    'text!../../../../moduals/print/billnotpl.html',
    'text!../../../../moduals/print/cartlisttpl.html',
    'text!../../../../moduals/print/paymentlisttpl.html',
    'text!../../../../moduals/print/numpadtpl.html',
    'text!../../../../moduals/print/tpl.html',
], function (BaseView, PrintModel, PrintCollection, KeyTipsView, billnotpl, cartlisttpl, paymentlisttpl, numpadtpl, tpl) {

    var printView = BaseView.extend({

        id: "printView",

        el: '.views',

        template: tpl,

        template_billno:billnotpl,

        template_cartlist:cartlisttpl,

        template_paymentlist:paymentlisttpl,

        template_numpad:numpadtpl,

        print_content:'',

        input: 'input[name = bill_date]',

        events: {
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
            'click .back-to-main':'onBackClicked',
            'click .help':'onHelpClicked',
            'click input[name = bill_date]':'focusInputDate',
            'click input[name = bill_no]':'focusInputNo',
            'click .print':'onPrintClicked'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.PRINT;
            this.model = new PrintModel();
            this.goodsCollection = new PrintCollection();
            this.gatherCollection = new PrintCollection();
        },

        initPlugins: function () {
            $(this.input).focus();
            this.initTemplates();
            this.$el.find('.for-numpad').html(this.template_numpad);
            $('.goods-detail').perfectScrollbar();  // 定制滚动条外观
            $('.gather-detail').perfectScrollbar();  // 定制滚动条外观
        },

        initTemplates: function () {
            this.template_billno = _.template(this.template_billno);
            this.template_cartlist = _.template(this.template_cartlist);
            this.template_paymentlist = _.template(this.template_paymentlist);
            this.template_numpad = _.template(this.template_numpad);
        },

        initLayoutHeight:function(){
            var dh = $(window).height();
            var nav = $('.navbar').height();  // 导航栏高度
            var panelheading = $('.panel-heading').height();  //面板heading高度
            var cart = dh - nav * 2 - panelheading * 4;
            $('.goods-detail').height(cart);  //设置购物车的高度
            $('.gather-detail').height(cart);
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.PRINT, window.KEYS.Esc, function () {
                router.navigate('main',{trigger:true});
            });

            this.bindKeyEvents(window.PAGE_ID.PRINT, window.KEYS.Enter, function () {
                _self.queryBillNo();
            });

            this.bindKeyEvents(window.PAGE_ID.PRINT, window.KEYS.Down, function () {
                _self.focusChange();
            });

            this.bindKeyEvents(window.PAGE_ID.PRINT, window.KEYS.Up, function() {
                _self.focusChange();
            });

            this.bindKeyEvents(window.PAGE_ID.PRINT, window.KEYS.T, function () {
                _self.openHelp();
            });

            this.bindKeyEvents(window.PAGE_ID.PRINT, window.KEYS.H, function () {
                _self.onReprintClicked();
            })

        },

        focusInputDate: function () {
            this.input = $('input[name = bill_date]');
        },

        focusInputNo: function () {
            this.input = $('input[name = bill_no]');
        },

        focusChange:function () {
            var isDateFocus = $('input[name = bill_date]').is(':focus');
            if(isDateFocus) {
                $('input[name = bill_no]').focus();
            }else {
                $('input[name = bill_date]').focus();
            }
        },

        renderBillNo: function () {
            this.$el.find('.bill-no').html(this.template_billno(this.model.toJSON()));
            return this;
        },

        renderCartlist: function () {
            this.$el.find('.goods-detail').html(this.template_cartlist(this.goodsCollection.toJSON()));
            return this;
        },

        renderPaymentlist: function () {
            this.$el.find('.gather-detail').html(this.template_paymentlist(this.gatherCollection.toJSON()));
            return this;
        },

        /**
         * 打印小票
         */
        onReprintClicked: function () {
            if(this.print_content == '') {
                toastr.warning('请先查询要打印的小票');
            }else {
                //data = {};
                var str = this.print_content;
                console.log(this.print_content);
                //data['directive'] = window.DIRECTIVES.PRINTTEXT;
                //data['content'] = str;
                //wsClient.send(JSON.stringify(data));
                //console.log('bill print');
                wsClient.send(DIRECTIVES.PRINTTEXT + str);
            }
        },
        /**
         * 查询订单信息
         */
        queryBillNo: function () {
            var _self = this;
            var date = $('input[name = bill_date]').val();
            var billNo = $('input[name = bill_no]').val();
            if(date == '' || billNo == '') {
                _self.focusChange();
            }
            if(date != '' && billNo != '') {
                var data = {};
                data['day'] = date;
                data['bill_no'] = billNo;
                this.request = new PrintModel();
                this.request.print(data, function (resp) {
                    if(resp.status == '00') {
                        _self.model.set({
                            'bill_no':billNo
                        });
                        _self.goodsCollection.set(resp.goods_detail);
                        _self.gatherCollection.set(resp.gather_detail);
                        _self.print_content = resp.printf;
                        _self.renderBillNo();
                        _self.renderCartlist();
                        _self.renderPaymentlist();
                    }else {
                        toastr.error(resp.msg);
                    }
                });
                $('input[name = bill_no]').val('');
                $('input[name = bill_date]').val('');
            }
        },

        openHelp: function () {
            var tipsView = new KeyTipsView('PRINT_PAGE');
            this.showModal(window.PAGE_ID.TIP_MEMBER, tipsView);
        },

        onPrintClicked: function () {
            this.onReprintClicked();
        },

        onOKClicked: function () {
            this.queryBillNo();
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


        onHelpClicked:function () {
           this.openHelp();
        },

        onBackClicked:function () {
            router.navigate('main',{trigger:true});
        },

    });

    return printView;
});