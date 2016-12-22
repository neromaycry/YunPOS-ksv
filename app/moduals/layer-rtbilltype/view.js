/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-rtbilltype/model',
    '../../moduals/layer-rtbilltype/collection',
    '../../moduals/layer-rtgatherui/view',
    '../layer-rtreturndate/view',
    'text!../../moduals/layer-rtbilltype/billingtypetpl.html',
    'text!../../moduals/layer-rtbilltype/tpl.html',
], function (BaseLayerView, RTLayerTypeModel, RTLayerTypeCollection, RTLayerGatherUIView,LayerReturnDateView, billingtypetpl, tpl) {

    var billtypeView = BaseLayerView.extend({

        id: "billtypeView",

        template: tpl,

        template_billingtype: billingtypetpl,

        i: 0,

        events: {
            'click .cancel': 'onCancelClicked',
            'click .ok': 'onOkClicked',
            'click [data-index]': 'onBillTypeClicked'
        },

        LayerInitPage: function () {
            console.log(this.attrs);
            var _self = this;
            this.model = new RTLayerTypeModel();
            this.collection = new RTLayerTypeCollection();
            var gatherKind = _self.attrs['gather_kind'];
            if (storage.isSet(system_config.GATHER_KEY)) {
                var tlist = storage.get(system_config.GATHER_KEY);
                this.visibleTypes = _.where(tlist, {visible_flag: '1'});
                var gatherList = _.where(this.visibleTypes, {gather_kind: gatherKind});
                for (var i in gatherList) {
                    var item = new RTLayerTypeModel();
                    item.set({
                        gather_id: gatherList[i].gather_id,
                        gather_name: gatherList[i].gather_name,
                        gather_ui:gatherList[i].gather_ui
                    });
                    this.collection.push(item);
                }
            }
            this.model.set({
                receivedsum: this.attrs['gather_money']
            });
            this.initTemplates();
            setTimeout(function () {
                _self.render();
                _self.renderBilltype();
            }, 100);
        },

        initTemplates: function () {
            this.template_billingtype = _.template(this.template_billingtype);
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_RT_BILLTYPE, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_RT_BILLTYPE, KEYS.Down, function () {
                _self.scrollDown();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_RT_BILLTYPE, KEYS.Up, function () {
                _self.scrollUp();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_RT_BILLTYPE, KEYS.Enter, function () {
                _self.onReceived(_self.i);
            });
        },

        /**
         * Enter和确定
         */
        onReceived: function (index) {
            var _self = this;
            var attrs = {};
            if (this.collection.length == 0) {
                layer.msg('当前大类支付方式为空', optLayerError);
                this.closeLayer(layerindex);
                return;
            }
            var gatherUI = this.collection.at(index).get('gather_ui');
            var gatherId = this.collection.at(index).get('gather_id');
            var gatherName = this.collection.at(index).get('gather_name');
            this.closeLayer(layerindex);
            switch (gatherUI) {
                case '04':
                case '05':
                    attrs = {
                        gather_id:gatherId,
                        gather_name:gatherName,
                        gather_ui:gatherUI,
                        gather_money:_self.attrs.gather_money,
                        gather_kind:_self.attrs.gather_kind,
                        bill_no: _self.attrs.bill_no
                    };
                    this.openLayer(PAGE_ID.LAYER_RT_BILLACCOUNT, PAGE_ID.BILLING_RETURN, '输入参考号和第三方支付单号', RTLayerGatherUIView, attrs, {area: '400px'});
                    break;
                case '06':
                    this.closeLayer(layerindex);
                    attrs = {
                        pageid:PAGE_ID.BILLING_RETURN,
                        gather_id: gatherId,
                        gather_name: gatherName,
                        gather_ui: gatherUI,
                        gather_money: _self.attrs.gather_money,
                        gather_kind: _self.attrs.gather_kind,
                        bill_no: _self.attrs.bill_no,
                        cashier_no: storage.get(system_config.LOGIN_USER_KEY, 'user_id'),
                        pos_no: storage.get(system_config.POS_INFO_KEY, 'posid'),
                    };
                    this.openLayer(PAGE_ID.LAYER_RETURN_DATE, PAGE_ID.BILLING_RETURN, '选择退货日期', LayerReturnDateView, attrs, {area:'300px'});
                    //this.openLayer(PAGE_ID.LAYER_RT_BILLACCOUNT, PAGE_ID.BILLING_RETURN, '输入系统参考号', RTLayerGatherUIView, attrs, {area: '400px'});
                    break;
                default ://输入账号类
                    this.closeLayer(layerindex);
                    attrs = {
                        gather_id: gatherId,
                        gather_ui: gatherUI,
                        gather_name: gatherName,
                        gather_money: this.attrs.gather_money,
                        gather_kind: this.attrs.gather_kind,
                    };
                    this.openLayer(PAGE_ID.LAYER_RT_BILLACCOUNT, PAGE_ID.BILLING_RETURN, gatherName, RTLayerGatherUIView, attrs, {area: '300px'});
                    break;
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

        onCancelClicked: function () {
            this.closeLayer(layerindex);
            $('input[name = billingrt]').focus();
        },

        onOkClicked: function () {
            this.onReceived(this.i);
        },

        onBillTypeClicked: function (e) {
            this.i = $(e.currentTarget).data('index');
            $(e.currentTarget).addClass('cus-selected').siblings().removeClass('cus-selected');
        }

    });

    return billtypeView;
});