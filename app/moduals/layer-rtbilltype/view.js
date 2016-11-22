/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-rtbilltype/model',
    '../../moduals/layer-rtbilltype/collection',
    '../../moduals/layer-rtgatherui/view',
    'text!../../moduals/layer-rtbilltype/billingtypetpl.html',
    'text!../../moduals/layer-rtbilltype/tpl.html',
], function (BaseLayerView,RTLayerTypeModel,RTLayerTypeCollection, RTLayerGatherUIView, billingtypetpl, tpl) {

    var billtypeView = BaseLayerView.extend({

        id: "billtypeView",

        template: tpl,

        template_billingtype:billingtypetpl,

        i:0,

        index:0,

        //input: 'input[name = gather-no]',

        events:{
            'click .cancel':'onCancelClicked',
            'click .ok':'onOkClicked',
            'click [data-index]':'onBillTypeClicked'
        },

        LayerInitPage: function () {
            var _self = this;
            this.model = new RTLayerTypeModel();
            this.collection = new RTLayerTypeCollection();
            var gatherKind = _self.attrs['gather_kind'];
            if(storage.isSet(system_config.GATHER_KEY)) {
                var tlist = storage.get(system_config.GATHER_KEY);
                this.visibleTypes = _.where(tlist,{visible_flag:'1'});
                var gatherList = _.where(this.visibleTypes ,{gather_kind:gatherKind});
                for(var i in gatherList){
                    var item = new RTLayerTypeModel();
                    item.set({
                        gather_id:gatherList[i].gather_id,
                        gather_name:gatherList[i].gather_name
                    });
                   this.collection.push(item);
                }
            }
            this.model.set({
                receivedsum:this.attrs['gather_money']
            });
            this.initTemplates();
            setTimeout(function () {
                _self.render();
                _self.renderBilltype();
            },100);

        },

        initTemplates: function () {
            this.template_billingtype = _.template(this.template_billingtype);
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_RT_BILLTYPE, KEYS.Esc , function () {
                _self.onCancelClicked();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_RT_BILLTYPE, KEYS.Down, function() {
               _self.scrollDown();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_RT_BILLTYPE, KEYS.Up, function() {
               _self.scrollUp();
            });

            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_RT_BILLTYPE, KEYS.Enter, function() {
                _self.onReceived(_self.i);
            });
        },

        /**
         * Enter和确定
         */
        onReceived:function(index) {
            var _self = this;
            var data = {};
            var gatherId = this.collection.at(index).get('gather_id');
            var gatherName = this.collection.at(index).get('gather_name');
            var gatherMoney = this.attrs.gather_money;
            var gatherKind = this.attrs.gather_kind;
            data['gather_id'] = gatherId;
            data['gather_name'] = gatherName;
            data['gather_money'] = gatherMoney;
            data['gather_kind'] = gatherKind;
            this.closeLayer(layerindex);
            switch (gatherId) {
                case '12':
                    this.openLayer(PAGE_ID.LAYER_RT_BILLACCOUNT, pageId, gatherName, RTLayerGatherUIView, data, {area: '300px'});
                    break;
                case '13':
                    this.openLayer(PAGE_ID.LAYER_RT_BILLACCOUNT, pageId, gatherName, RTLayerGatherUIView, data, {area: '300px'});
                    break;
                default :
                    this.openLayer(PAGE_ID.LAYER_RT_BILLACCOUNT, pageId, gatherName, RTLayerGatherUIView, data, {area: '300px'});

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

        onCancelClicked: function () {
           this.closeLayer(layerindex);
            $('input[name = billingrt]').focus();
        },

        onOkClicked: function () {
            //var index = $('.cus-selected').data('index');
            console.log(this.index);
            this.onReceived(this.index);
        },

        onBillTypeClicked: function (e) {
            this.index = $(e.currentTarget).data('index');
            $(e.currentTarget).addClass('cus-selected').siblings().removeClass('cus-selected');
        }

    });

    return billtypeView;
});