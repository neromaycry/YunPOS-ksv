/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-billtype/model',
    '../../moduals/layer-billtype/collection',
    '../../moduals/layer-gatherui/view',
    'text!../../moduals/layer-billtype/billingtypetpl.html',
    'text!../../moduals/layer-billtype/receivedsumtpl.html',
    'text!../../moduals/layer-billtype/tpl.html',
], function (BaseLayerView, LayerBillTypeModel, LayerBillTypeCollection, layerGatherUIView, billingtypetpl,receivedsumtpl, tpl) {

    var layerbilltypeView = BaseLayerView.extend({

        id: "layerbilltypeView",

        template: tpl,

        template_billingtype: billingtypetpl,

        template_receivedsum: receivedsumtpl,

        i: 0,

        index: 0,

        events: {
            'click .cancel': 'onCancelClicked',
            'click .ok': 'onOkClicked',
            'click [data-index]': 'onBillTypeClicked'
        },

        LayerInitPage: function () {
            console.log(this.attrs);
            var _self = this;
            this.model = new LayerBillTypeModel();
            this.requestmodel = new LayerBillTypeModel();
            this.model.set({
                receivedsum: this.attrs['gather_money']
            });
            var gatherKind = this.attrs['gather_kind'];
            if (storage.isSet(system_config.GATHER_KEY)) {
                this.collection = new LayerBillTypeCollection();
                var tlist = storage.get(system_config.GATHER_KEY);
                this.visibleTypes = _.where(tlist, {visible_flag: '1'});
                var gatherList = _.where(this.visibleTypes, {gather_kind: gatherKind});
                for (var i in gatherList) {
                    var item = new LayerBillTypeModel();
                    item.set({
                        gather_id: gatherList[i].gather_id,
                        gather_name: gatherList[i].gather_name
                    });
                    this.collection.push(item);
                }
            }
            this.initTemplates();
            setTimeout(function () {
                _self.renderReceivedsum();
                _self.renderBilltype();
            }, 100);
        },

        initTemplates: function () {
            this.template_billingtype = _.template(this.template_billingtype);
            this.template_receivedsum = _.template(this.template_receivedsum);
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_BILLING_TYPE, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
            this.bindLayerKeyEvents(PAGE_ID.LAYER_BILLING_TYPE, KEYS.Down, function () {
                _self.scrollDown();
            });
            this.bindLayerKeyEvents(PAGE_ID.LAYER_BILLING_TYPE, KEYS.Up, function () {
                _self.scrollUp();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_BILLING_TYPE, KEYS.Enter, function () {
                _self.onReceived(_self.i);
            });
        },

        /**
         * Enter和确定
         */
        onReceived: function (index) {
            var _self = this;
            var gatherId = this.collection.at(index).get('gather_id');
            //var gatherModel = _.where(this.visibleTypes, {gather_id: gatherId});
            var gatherName = this.collection.at(index).get('gather_name');
            var data = {};
            var xfbdata = {};//生成payment_bill
            data['gather_id'] = gatherId;
            data['gather_name'] = gatherName;
            data['gather_money'] = this.attrs.gather_money;
            data['gather_kind'] = this.attrs.gather_kind;
            xfbdata['pos_id'] = '002';
            xfbdata['bill_no'] = this.attrs.bill_no;
            this.closeLayer(layerindex);
            switch (gatherId) {
                case '05':
                    data['payment_bill'] = ''
                    this.openLayer(PAGE_ID.LAYER_BILLING_ACCOUNT, PAGE_ID.BILLING, '银行卡支付确认', layerGatherUIView, data, {area: '300px'});
                    break;
                case '12':
                    this.requestmodel.xfbbillno(xfbdata, function (resp) {
                        if (resp.status == '00') {
                            data['payment_bill'] = resp.xfb_bill,
                            _self.openLayer(PAGE_ID.LAYER_BILLING_ACCOUNT, PAGE_ID.BILLING, gatherName, layerGatherUIView, data, {area: '600px'});
                        } else {
                            toastr.error(resp.msg);
                        }
                    });
                    break;
                case '13':
                    this.requestmodel.xfbbillno(xfbdata, function (resp) {
                        if (resp.status == '00') {
                            data['payment_bill'] = resp.xfb_bill,
                            _self.openLayer(PAGE_ID.LAYER_BILLING_ACCOUNT, PAGE_ID.BILLING, gatherName, layerGatherUIView, data, {area: '600px'});
                        } else {
                            toastr.error(resp.msg);
                        }
                    });
                    break;
                default:
                    data['payment_bill'] = ''
                    this.openLayer(PAGE_ID.LAYER_BILLING_ACCOUNT, PAGE_ID.BILLING, gatherName, layerGatherUIView, data, {area: '300px'});
            }
            //if(gatherUI == '01' && gatherId != '05'){
            //    var gaterUIView = new GatherUIView({
            //        pageid:window.PAGE_ID.BILLING,
            //        currentid:window.PAGE_ID.BILLING_ACCOUNT,
            //        gather_id:gatherId,
            //        gather_name:gatherName,
            //        gather_ui:gatherUI,
            //        gather_kind:gatherKind,
            //        gather_money:gatherMoney ,
            //        callback: function (attrs) {
            //            var gatherNo = $('input[name = receive-account]').val();
            //            var attrData = {};
            //            attrData['gather_id'] = attrs.gather_id;
            //            attrData['gather_money'] = attrs.gather_money;
            //            attrData['gather_name'] = attrs.gather_name;
            //            attrData['gather_no'] = gatherNo;
            //            attrData['gather_kind'] = attrs.gather_kind;
            //            attrData['payment_bill'] = '';
            //            Backbone.trigger('onReceivedsum',attrData);
            //            _self.hideModal(window.PAGE_ID.BILLING);
            //            $('input[name = billing]').focus();
            //        }
            //    });
            //    this.showModal(window.PAGE_ID.BILLING_ACCOUNT, gaterUIView);
            //    $('.modal').on('shown.bs.modal',function(e) {
            //        $('input[name = receive-account]').focus();
            //    });
            //}else if(gatherUI == '04'){
            //    var xfbdata = {};
            //    xfbdata['pos_id'] = '002';
            //    xfbdata['bill_no'] = _self.attrs.bill_no;
            //    this.requestmodel.xfbbillno(xfbdata, function(resp) {
            //        if(resp.status == '00') {
            //            var gaterUIView = new GatherUIView({
            //                pageid:window.PAGE_ID.BILLING,
            //                currentid:window.PAGE_ID.ALIPAY,
            //                gather_id:gatherId,
            //                gather_name:gatherName,
            //                gather_ui:gatherUI,
            //                gather_kind:gatherKind,
            //                gather_money:gatherMoney,
            //                payment_bill:resp.xfb_bill,
            //                callback:function (attrs) {
            //                    var gatherNo = $('input[name = alipay-account]').val();
            //                    var attrData = {};
            //                    attrData['gather_id'] = attrs.gather_id;
            //                    attrData['gather_money'] = attrs.gather_money;
            //                    attrData['gather_name'] = attrs.gather_name;
            //                    attrData['gather_no'] = gatherNo;
            //                    attrData['gather_kind'] = attrs.gather_kind;
            //                    attrData['payment_bill'] = attrs.payment_bill;
            //                    _self.micropay(gatherUI, gatherNo,attrData,attrs.payment_bill);
            //                }
            //            });
            //            _self.showModal(window.PAGE_ID.ALIPAY,gaterUIView);
            //            $('.modal').on('shown.bs.modal',function(e) {
            //                $('input[name = alipay-account]').focus();
            //            });
            //        }else {
            //            toastr.error(resp.msg);
            //        }
            //    });
            //}else if(gatherUI == '05'){
            //    var xfbdata = {};
            //    xfbdata['pos_id'] = '002';
            //    xfbdata['bill_no'] = _self.attrs.bill_no;
            //    this.requestmodel.xfbbillno(xfbdata, function(resp) {
            //        if(resp.status == '00') {
            //            var gaterUIView = new GatherUIView({
            //                pageid:window.PAGE_ID.BILLING,
            //                currentid:window.PAGE_ID.WECHAT,
            //                gather_id:gatherId,
            //                gather_name:gatherName,
            //                gather_ui:gatherUI,
            //                gather_kind:gatherKind,
            //                gather_money:gatherMoney,
            //                payment_bill:resp.xfb_bill,
            //                callback:function (attrs) {
            //                    var gatherNo = $('input[name = wechat-account]').val();
            //                    var attrData = {};
            //                    attrData['gather_id'] = attrs.gather_id;
            //                    attrData['gather_money'] = attrs.gather_money;
            //                    attrData['gather_name'] = attrs.gather_name;
            //                    attrData['gather_no'] = gatherNo;
            //                    attrData['gather_kind'] = attrs.gather_kind;
            //                    attrData['payment_bill'] = attrs.payment_bill;
            //                    _self.micropay(gatherUI, gatherNo,attrData, attrs.payment_bill);
            //                }
            //            });
            //            _self.showModal(window.PAGE_ID.WECHAT,gaterUIView);
            //            $('.modal').on('shown.bs.modal',function(e) {
            //                $('input[name = wechat-account]').focus();
            //            });
            //        }else {
            //            toastr.error(resp.msg);
            //        }
            //    });
            //}else if(gatherId == '05') {
            //    var data = {};
            //    data['gather_id'] = gatherId;
            //    data['gather_name'] = gatherName;
            //    data['gather_ui'] = gatherUI;
            //    data['gather_kind'] = gatherKind;
            //    data['gather_money'] = gatherMoney;
            //    data['bill_no'] = _self.attrs.bill_no;
            //    data['currentid'] = window.PAGE_ID.MODAL_POS;
            //    data['pageid'] = window.PAGE_ID.BILLING
            //    var gatherUIView = new GatherUIView(data);
            //    this.showModal(window.PAGE_ID.MODAL_POS, gaterUIView);
            //}
        },

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

        renderReceivedsum: function () {
            this.$el.find('.for-receivedsum').html(this.template_receivedsum(this.model.toJSON()));
            return this;
        },

        onCancelClicked: function () {
            this.closeLayer(layerindex);
        },

        onOkClicked: function () {
            //var index = $('.cus-selected').data('index');
            this.onReceived(this.index);
        },

        onBillTypeClicked: function (e) {
            this.index = $(e.currentTarget).data('index');
            $(e.currentTarget).addClass('cus-selected').siblings().removeClass('cus-selected');
        }

    });

    return layerbilltypeView;
});