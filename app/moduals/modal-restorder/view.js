/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-restorder/model',
    '../../moduals/modal-restorder/collection',
    'text!../../moduals/modal-restorder/tpl.html',
], function (BaseModalView, RestOrderModel, RestOrderCollection, tpl) {

    var restOrderView = BaseModalView.extend({

        id: "restOrderView",

        template: tpl,

        input: 'input[name = restorder]',

        events:{
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked'
        },


        modalInitPage: function () {
            //var _self = this;
            this.model = new RestOrderModel();
            this.collection = new RestOrderCollection();
            if(storage.isSet(system_config.RESTORDER_KEY)) {
                this.obj = storage.get(window.system_config.RESTORDER_KEY);
            }
        },
        onCancelClicked: function () {
            this.hideModal(window.PAGE_ID.MAIN);
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

        onOKClicked: function () {
            this.releaseOrder();
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.MODAL_RESTORDER, window.KEYS.Enter, function () {
                _self.releaseOrder();
                $('input[name = main]').focus();
            });
            this.bindModalKeyEvents(window.PAGE_ID.MODAL_RESTORDER, window.KEYS.Esc, function () {
                _self.hideModal(window.PAGE_ID.MAIN);
                $('input[name = main]').focus();
            });
        },

        releaseOrder: function () {
            var value = $(this.input).val();
            if (value == '') {
                toastr.warning('请输入挂单号');
            } else {
                var orderSelected = _.pick(this.obj, value);
                if (_.isEmpty(orderSelected)) {
                    toastr.warning('没有这个挂单号');
                    $(this.input).val('');
                } else {
                    var orderSelectedDetail = orderSelected[value];
                    console.log(orderSelectedDetail);
                    Backbone.trigger('onReleaseOrder',orderSelectedDetail);
                    storage.remove(system_config.RESTORDER_KEY,value);
                    this.hideModal(window.PAGE_ID.MAIN);
                    toastr.success('解挂成功');
                }
            }
        }

    });

    return restOrderView;
});