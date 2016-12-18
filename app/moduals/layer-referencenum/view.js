/**
 * Created by xuying on 2016/11/25.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-referencenum/model',
    'text!../../moduals/layer-referencenum/tpl.html',
], function (BaseLayerView, LayerReferenceModel, tpl) {

    var referencenumView = BaseLayerView.extend({

        id: "referencenumView",

        template: tpl,

        input: 'input[name = reference-num]',

        events: {
            'click .cancel': 'onCancelClicked',
            'click .ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked'
        },

        LayerInitPage: function () {
            this.model = new LayerReferenceModel();
        },

        onLayerShown: function () {
            if (storage.get(system_config.INTERFACE_TYPE) == Interface_type.CCB_LANDI) {
                $(this.input).attr('placeholder', '请输入流水号');
            }
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_REFERENCE_NUM, KEYS.Enter, function () {
                _self.onOKClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_REFERENCE_NUM, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
        },

        onCancelClicked: function () {
            this.closeLayer(layerindex);
            $('input[name = billing]').focus();
        },

        onNumClicked: function (e) {
            var value = $(e.currentTarget).data('num');
            var str = $(this.input).val();
            str += value;
            $(this.input).val(str);
        },

        onBackspaceClicked: function (e) {
            var str = $(this.input).val();
            str = str.substring(0, str.length - 1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

        onOKClicked: function () {
            var value = $(this.input).val();
            switch (storage.get(system_config.INTERFACE_TYPE)) {
                case Interface_type.ABC_BJCS:
                    if (value == '') {
                        layer.msg('请输入系统参考号', optLayerWarning);
                        return;
                    }
                    var data = {
                        transaction_amount: this.attrs.transaction_amount,
                        cashier_no: this.attrs.cashier_no,
                        pos_no: this.attrs.pos_no,
                        bill_no: this.attrs.bill_no,
                        reference_number: value
                    };
                    break;
                case Interface_type.CCB_LANDI:
                    if (value == '') {
                        layer.msg('请输入流水号', optLayerWarning);
                        return;
                    }
                    var data = {
                        transaction_amount: this.attrs.transaction_amount,
                        cashier_no: this.attrs.cashier_no,
                        pos_no: this.attrs.pos_no,
                        bill_no: this.attrs.bill_no,
                        serial_no: value
                    };
                    break;
            }
            this.sendWebSocketDirective([DIRECTIVES.Bank_backout], [JSON.stringify(data)], wsClient);
        },
        
        refund: function () {
            
        }
    });

    return referencenumView;
});