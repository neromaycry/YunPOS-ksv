/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-paytable/model',
    '../../moduals/layer-paytable/collection',
    'text!../../moduals/layer-paytable/gatherdetailtpl.html',
    'text!../../moduals/layer-paytable/sumtpl.html',
    'text!../../moduals/layer-paytable/tpl.html'
], function (BaseLayerView, LayerPaytableModel, LayerPaytableCollection, gatherdetailtpl, sumtpl, tpl) {

    var layerPaytableView = BaseLayerView.extend({

        id: "layerPaytableView",

        template: tpl,

        template_gatherdetail: gatherdetailtpl,

        template_sum: sumtpl,

        input: 'input[name = paytable-num]',

        listnum: 10,

        i: 0,

        n: 0,

        totalamount: 0,//总金额

        listheight: 0,//购物车的高度

        events: {
            'click .cancel': 'onCancelClicked',
            'click .ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked',
            'click .keyup': 'onKeyUpClicked',
            'click .keydown': 'onKeyDownClicked',
            'click .print-paytable': 'onPrintClicked'
        },

        LayerInitPage: function () {
            var _self = this;
            this.model = new LayerPaytableModel();
            this.collection = new LayerPaytableCollection();
            this.model.set({
                sum: this.totalamount
            });
            var currencyList = ['100', '50', '20', '10', '5', '2', '1', '0.5', '0.2', '0.1'];
            for (var i in currencyList) {
                var temp = new LayerPaytableModel();
                temp.set({
                    gather_id: '',
                    gather_name: currencyList[i],
                    cash_flag: '1',
                    num: 0,
                    sum: 0
                });
                _self.collection.push(temp);
            }
            if (storage.isSet(system_config.GATHER_KEY)) {
                var tlist = storage.get(system_config.GATHER_KEY);
                var visibleTypes = _.where(tlist, {visible_flag: '1'});
                for (var i in visibleTypes) {
                    var temp = new LayerPaytableModel();
                    temp.set({
                        gather_id: visibleTypes[i].gather_id,
                        gather_name: visibleTypes[i].gather_name,
                        cash_flag: '0',
                        num: 0,
                        sum: 0
                    });
                    _self.collection.push(temp);
                }
            }
            this.initTemplates();
            this.initLayoutHeight();
            setTimeout(function () {
                _self.initLayoutHeight();
                _self.renderGatherDetail();
                _self.renderSum();
                //$('.li-gatherlist').height(_self.listheight / _self.listnum - 11);
            }, 100);

        },


        initLayoutHeight: function () {
            var dh = $(window).height();
            var panelheight = dh / 2;
            this.listheight = panelheight;//购物车列表的高度
            $('.gather-detail').height(this.listheight);
            $('.gather-detail').perfectScrollbar();  // 定制滚动条外观
        },

        initTemplates: function () {
            this.template_gatherdetail = _.template(this.template_gatherdetail);
            this.template_sum = _.template(this.template_sum);
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_PAYTABLE, KEYS.Enter, function () {
                _self.onOKClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_PAYTABLE, KEYS.Esc, function () {
                _self.onCancelClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_PAYTABLE, KEYS.P, function () {
                _self.onPrintClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_PAYTABLE, KEYS.Down, function () {
                _self.onKeyDownClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_PAYTABLE, KEYS.Up, function () {
                _self.onKeyUpClicked();
            });
        },


        renderGatherDetail: function () {
            this.$el.find('.gather-detail').html(this.template_gatherdetail(this.collection.toJSON()));
            $('.li-gatherlist').height(this.listheight / this.listnum - 11);
            $('#li' + this.i).addClass('cus-selected');
            return this;
        },

        renderSum: function () {
            this.$el.find('.sum').html(this.template_sum(this.model.toJSON()));
            return this;
        },
        /**
         * 计算总金额
         */
        calculateSum: function () {
            this.totalamount = 0;
            var sumList = this.collection.pluck('sum');
            for (var i = 0; i < this.collection.length; i++) {
                this.totalamount += sumList[i];
            }
            this.model.set({
                sum: this.totalamount
            });
            this.renderSum();
        },
        /**
         * 购物车光标向下
         */
        onKeyDownClicked: function () {
            if (this.i < this.collection.length - 1) {
                this.i++;
            }
            if (this.i % this.listnum == 0 && this.n < parseInt(this.collection.length / this.listnum)) {
                this.n++;
                $('.gather-detail').scrollTop(this.listheight * this.n);
            }
            $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },
        /**
         * 购物车光标向上
         */
        onKeyUpClicked: function () {
            if (this.i > 0) {
                this.i--;
            }
            if ((this.i + 1) % this.listnum == 0 && this.i > 0) {
                this.n--;
                $('.gather-detail').scrollTop(this.listheight * this.n);
            }
            $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },

        onCancelClicked: function () {
            this.closeLayer(layerindex);
            $('input[name = main]').focus();
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
            var val = $(this.input).val();
            console.log(this.collection);
            var temp = this.collection.at(this.i);
            var gatherId = temp.get('gather_id');
            var gatherName = temp.get('gather_name');
            if (gatherId == '') {
                if (val == '' || (val.split('.').length - 1) > 0 || val == '.') {
                    layer.msg('无效的数量', optLayerWarning);
                    $(this.input).val('');
                    return;
                }
                temp.set({
                    num: parseFloat(val),
                    sum: parseFloat(val) * parseFloat(gatherName)
                });
            }
            if (gatherId != '') {
                if (val == '' || (val.split('.').length - 1) > 1 || val == '.') {
                    layer.msg('无效的金额', optLayerWarning);
                    $(this.input).val('');
                    return;
                }
                temp.set({
                    num: parseFloat(val),
                    sum: parseFloat(val)
                });
            }
            $(this.input).val('');
            this.calculateSum();
            this.renderGatherDetail();
        },

        onPrintClicked: function () {
            var _self = this;
            var list = this.collection.toJSON();
            //console.log(list);
            //console.log(list.length);
            var filteredList = _.filter(list, function (item) {
                //console.log(item);
                return item.num != 0;
            });
            if (filteredList.length == 0) {
                layer.msg('请输入数量', optLayerWarning);
                return;
            }
            this.model.printPayTable({data: filteredList}, function (resp) {
                if (!$.isEmptyObject(resp)) {
                    if (resp.status == '00') {
                        _self.sendWebSocketDirective([DIRECTIVES.PRINTTEXT], [resp.printf], wsClient);
                        layer.msg('缴款单已打印', optLayerSuccess);
                        _self.closeLayer(layerindex);
                    } else {
                        layer.msg(resp.msg, optLayerWarning);
                    }
                } else {
                    layer.msg('服务器错误，请联系管理员', optLayerError);
                }
            });
        }

    });

    return layerPaytableView;
});