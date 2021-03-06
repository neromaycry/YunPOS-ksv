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
], function (BaseLayerView, LayerBillTypeModel, LayerBillTypeCollection, layerGatherUIView, billingtypetpl, receivedsumtpl, tpl) {

    var layerbilltypeView = BaseLayerView.extend({

        id: "layerbilltypeView",

        template: tpl,

        template_billingtype: billingtypetpl,

        template_receivedsum: receivedsumtpl,

        i: 0,

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
                receivedsum: this.attrs.gather_money
            });
            this.collection = new LayerBillTypeCollection();
            var gatherKind = this.attrs.gather_kind;
            console.log(gatherKind);
            if (storage.isSet(system_config.GATHER_KEY)) {
                var tlist = storage.get(system_config.GATHER_KEY);
                var gatherList = _.where(tlist, {gather_kind: gatherKind, visible_flag: '1'});
                for (var i = 0, len = gatherList.length; i < len; i++) {
                    var item = new LayerBillTypeModel();
                    item.set({
                        gather_id: gatherList[i].gather_id,
                        gather_name: gatherList[i].gather_name,
                        gather_ui: gatherList[i].gather_ui
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
                _self.confirm(_self.i);
            });
        },

        /**
         * Enter和确定
         */
        confirm: function (index) {
            console.log(this.collection.toJSON());
            var _self = this;
            var attrs = {};
            if (this.collection.length == 0) {
                layer.msg('当前大类支付方式为空', optLayerError);
                this.closeLayer(layerindex);
                return;
            }
            var gatherUI = this.collection.at(index).get('gather_ui');
            var gatherid = this.collection.at(index).get('gather_id');
            var gatherName = this.collection.at(index).get('gather_name');
            console.log(gatherUI);
            switch (gatherUI) {//gather_ui:判断接下来打开的是哪种界面
                case '04':
                case '05'://第三方支付类
                    var xfbdata = {
                        pos_id: storage.get(system_config.POS_INFO_KEY, 'posid'),
                        bill_no: this.attrs.bill_no
                    };//生成payment_bill
                    this.requestmodel.xfbbillno(xfbdata, function (resp) {
                        if (resp.status == '00') {
                            _self.closeLayer(layerindex);
                            attrs = {
                                gather_id: gatherid,
                                gather_ui: gatherUI,
                                gather_name: gatherName,
                                gather_money: _self.attrs.gather_money,
                                gather_kind: _self.attrs.gather_kind,
                                payment_bill: resp.xfb_bill,
                            };
                            _self.openLayer(PAGE_ID.LAYER_BILLING_ACCOUNT, PAGE_ID.BILLING, gatherName, layerGatherUIView, attrs, {area: '600px'});
                        } else {
                            layer.msg(resp.msg, optLayerError);
                        }
                    });
                    break;
                case '06'://银行mis
                    this.closeLayer(layerindex);
                    attrs = {
                        gather_id: gatherid,
                        gather_ui: gatherUI,
                        gather_name: gatherName,
                        gather_money: _self.attrs.gather_money,
                        gather_kind: _self.attrs.gather_kind,
                        bill_no: _self.attrs.bill_no,
                    };
                    this.openLayer(PAGE_ID.LAYER_BILLING_ACCOUNT, PAGE_ID.BILLING, '银行MIS支付确认', layerGatherUIView, attrs, {area: '300px'});
                    break;
                default ://输入账号类
                    this.closeLayer(layerindex);
                    attrs = {
                        gather_id: gatherid,
                        gather_ui: gatherUI,
                        gather_name: gatherName,
                        gather_money: this.attrs.gather_money,
                        gather_kind: this.attrs.gather_kind,
                    };
                    this.openLayer(PAGE_ID.LAYER_BILLING_ACCOUNT, PAGE_ID.BILLING, gatherName, layerGatherUIView, attrs, {area: '300px'});
            }
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
        scrollUp: function () {
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
            this.confirm(this.i);
        },

        onBillTypeClicked: function (e) {
            this.i = $(e.currentTarget).data('index');
            $(e.currentTarget).addClass('cus-selected').siblings().removeClass('cus-selected');
        }

    });

    return layerbilltypeView;
});