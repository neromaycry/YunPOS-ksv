/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/paytable/model',
    '../../../../moduals/paytable/collection',
    '../../../../moduals/layer-help/view',
    'text!../../../../moduals/paytable/numpadtpl.html',
    'text!../../../../moduals/paytable/gatherdetailtpl.html',
    'text!../../../../moduals/paytable/sumtpl.html',
    'text!../../../../moduals/paytable/tpl.html',
], function (BaseView, PayTableModel, PayTableCollection, LayerHelpView, numpadtpl, gatherdetailtpl, sumtpl, tpl) {

    var paytableView = BaseView.extend({

        id: "paytableView",

        el: '.views',

        template: tpl,

        template_numpad: numpadtpl,

        template_gatherdetail: gatherdetailtpl,

        template_sum:sumtpl,

        input: 'input[name = paytable-num]',

        i: 0,

        n: 0,

        listnum: 11,

        totalamount: 0,//总金额

        events: {
            'click .numpad-ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked',
            'click .passwd_return': 'onReturnClicked',
            'click .passwd_help': 'onHelpClicked',
            'click .key-down': 'onKeyDownClicked',
            'click .key-up': 'onKeyUpClicked',
            'click .ok': 'onOkClicked',
            'click .print': 'onPrintClicked'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.PAYTABLE;
            var _self = this;
            this.model = new PayTableModel();
            this.collection = new PayTableCollection();
            this.model.set({
                sum: this.totalamount
            });
            var currencyList = ['100', '50', '20', '10', '5', '2', '1', '0.5', '0.2', '0.1'];
            for (var i in currencyList) {
                var temp = new PayTableModel();
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
                    var temp = new PayTableModel();
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
        },

        initPlugins: function () {
            $(this.input).focus();
            this.$el.find('.for-numpad').html(this.template_numpad);
            this.initHeight();
            this.renderGatherDetail();
            this.renderSum();
        },

        initHeight: function () {
            var dh = $(window).height();
            var dw = $(window).width();
            var nav = $('.navbar').height();
            var panelheading = $('.panel-heading').height();
            var panelfooter = $('.panel-footer').height();
            var cartHeight = dh - nav * 3 - panelheading * 3 - panelfooter;
            var leftWidth = $('.main-left').width();
            var cartWidth = dw - leftWidth - 45;
            $('.cart-panel').width(cartWidth);
            $('.gather-detail').height(cartHeight);
            this.listheight = $('.gather-detail').height();
            // this.listnum = 11; //设置商品列表中的条目数
            // $('.li-gatherlist').height(this.listheight / this.listnum - 21);
        },


        initTemplates: function () {
            this.template_gatherdetail = _.template(this.template_gatherdetail);
            this.template_sum = _.template(this.template_sum);
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.PAYTABLE, window.KEYS.Esc, function () {
                _self.onReturnClicked();
            });

            this.bindKeyEvents(window.PAGE_ID.PAYTABLE, window.KEYS.Down, function () {
                _self.onKeyDownClicked();
            });

            this.bindKeyEvents(window.PAGE_ID.PAYTABLE, window.KEYS.Up, function () {
                _self.onKeyUpClicked();
            });

            this.bindKeyEvents(window.PAGE_ID.PAYTABLE, window.KEYS.Enter, function () {
                _self.onOKClicked();
            });

            this.bindKeyEvents(window.PAGE_ID.PAYTABLE, window.KEYS.T, function () {
                _self.onHelpClicked();
            });

            this.bindKeyEvents(window.PAGE_ID.PAYTABLE, window.KEYS.P, function () {
                _self.onPrintClicked();
            });
        },

        onHelpClicked: function () {
            var attrs = {
                page: 'PAYTABLE_PAGE',
                pageid: pageId
            };
            this.openLayer(PAGE_ID.LAYER_HELP, pageId, '帮助', LayerHelpView, attrs, {area: '600px'});
        },

        onKeyDownClicked: function () {
            this.scrollDown('gather-detail', 'paytable');
        },

        onKeyUpClicked: function () {
            this.scrollUp('gather-detail', 'paytable');
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
            var filteredList = _.filter(list, function (item) {
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
                        router.navigate('main', {trigger: true});
                        $('input[name = checking_date]').focus();
                    } else {
                        layer.msg(resp.msg, optLayerWarning);
                    }
                } else {
                    layer.msg('服务器错误，请联系管理员', optLayerError);
                }
            });
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

        renderGatherDetail: function () {
            this.$el.find('.gather-detail').html(this.template_gatherdetail(this.collection.toJSON()));
            $('.li-gatherlist').height(this.listheight / this.listnum - 21);
            $('#paytable' + this.i).addClass('cus-selected');
            return this;
        },

        renderSum: function () {
            this.$el.find('.sum').html(this.template_sum(this.model.toJSON()));
            return this;
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

        onReturnClicked: function () {
            router.navigate('main', {trigger: true});
        }


    });

    return paytableView;
});