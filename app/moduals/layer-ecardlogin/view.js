/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-ecardlogin/model',
    '../../moduals/layer-ecardpay/view',
    '../../moduals/layer-rtecardpay/view',
    'text!../../moduals/layer-ecardlogin/magcardtpl.html',
    'text!../../moduals/layer-ecardlogin/tpl.html',
], function (BaseLayerView, LayerECardModel, LayerECardpayView, RTLayerECardPayView, magcardtpl, tpl) {

    var layerECardView = BaseLayerView.extend({

        id: "layerECardView",

        template: tpl,

        template_magcard: magcardtpl,

        type: '01',

        input: 'input[name = ecard]',

        events: {
            'click .cancel': 'onCancelClicked',
            'click [data-index]': 'onLoginListClicked',
        },

        LayerInitPage: function () {
            console.log(this.attrs);
            var _self = this;
            this.initTemplates();
            this.model = new LayerECardModel();
            this.request = new LayerECardModel();
            setTimeout(function () {
                _self.renderByType(_self.type);
            }, 100);
            this.handleEvents();
        },

        initTemplates: function () {
            this.template_magcard = _.template(this.template_magcard);
        },

        handleEvents: function () {
            Backbone.off('onICEcardManualRead');
            Backbone.on('onICEcardManualRead', this.onICEcardManualRead, this);
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_ECARD_LOGIN, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_ECARD_LOGIN, KEYS.Enter, function () {
                _self.onOkClicked();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_ECARD_LOGIN, KEYS.X, function () {
                _self.changeTemplate(1);
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_ECARD_LOGIN, KEYS.I, function () {
                _self.changeTemplate(2);
            });
            //this.bindLayerKeyEvents(window.PAGE_ID.LAYER_ECARD_LOGIN, KEYS.P, function () {
            //    _self.changeTemplate(3);
            //});
        },

        onCancelClicked: function () {
            this.confirmHideLayer(this.attrs.pageid);
            //this.closeLayer(layerindex);
            //if (this.attrs.pageid == 6) {
            //    $('input[name = billing]').focus();
            //} else {
            //    $('input[name = billingrt]').focus();
            //}
        },

        onOkClicked: function () {
            var _self = this;
            var cardId = $('input[name = ecard]').val();
            var data = {};
            data['mobile'] = cardId;
            data['password'] = '*';
            data['type'] = this.type;
            this.request.getVipInfo(data, function (resp) {
                if (!$.isEmptyObject(resp)) {
                    if (resp.status == '00') {
                        var attrs = {
                            pageid: _self.attrs.pageid,
                            card_id: cardId,
                            cust_id: resp.cust_id,
                            unpaidamount: _self.attrs.unpaidamount,
                            gather_money: _self.attrs.gather_money,
                            goods_detail: _self.attrs.goods_detail,
                            gather_detail: _self.attrs.gather_detail,
                            account_type_code: resp.account_type_code
                        };
                        _self.closeLayer(layerindex);
                        if(_self.attrs.pageid == 6) {
                            _self.openLayer(PAGE_ID.LAYER_ECARD_PAY, PAGE_ID.BILLING, '一卡通支付', LayerECardpayView, attrs, {area: '900px'});
                        }else {
                            _self.openLayer(PAGE_ID.RT_LAYER_ECARD_PAY, PAGE_ID.BILLING_RETURN, '一卡通退款', RTLayerECardPayView, attrs, {area: '900px'});
                        }
                    } else {
                        layer.msg(resp.msg, optLayerError);
                    }
                } else {
                    layer.msg('系统错误，请联系管理员', optLayerWarning);
                }
            });
        },

        renderByType: function (type) {
            switch (type) {
                case '01':
                    this.$el.find('.for-member-login').html(this.template_magcard(this.model.toJSON()));
                    return this;
                    break;
            }
        },

        changeTemplate: function (index) {
            var _self = this;
            switch (index) {
                case 1:
                    this.type = '01';
                    this.input = 'input[name = ecard]';
                    this.renderByType(this.type);
                    $('input[name = ecard]').koala({
                        delay: 2000,
                        keyup: function (event) {
                            _self.swipeCard();
                        }
                    });
                    break;
                case 2:
                    this.sendWebSocketDirective([DIRECTIVES.IC_CARD_MANUAL_READ], [''], wsClient);
                    break;
            }
            $(this.input).focus();
        },

        onLoginListClicked: function (e) {
            var index = $(e.currentTarget).data('index');
            console.log(index);
            this.changeTemplate(index);
        },

        /**
         * 刷卡输入
         */
        swipeCard: function () {
            var _self = this;
            var value = $('input[name = ecard]').val();
            if (!value) {
                return;
            }
            var data = {};
            var tracks = ['track1', 'track2', 'track3'];
            var trackValues = this.parseMagTracks(value);
            for (var i = 0; i < tracks.length; i++) {
                data[tracks[i]] = trackValues[i];
            }
            data['type'] = '01';
            this.request.getVipInfo(data, function (resp) {
                console.log(resp);
                if (!$.isEmptyObject(resp)) {
                    if (resp.status == '00') {
                        var attrs = {
                            pageid: _self.attrs.pageid,
                            card_id: trackValues[2],
                            cust_id: resp.cust_id,
                            unpaidamount: _self.attrs.unpaidamount,
                            gather_money: _self.attrs.gather_money,
                            goods_detail: _self.attrs.goods_detail,
                            gather_detail: _self.attrs.gather_detail,
                            account_type_code: resp.account_type_code
                        };
                        _self.closeLayer(layerindex);
                        if(_self.attrs.pageid == 6) {
                            _self.openLayer(PAGE_ID.LAYER_ECARD_PAY, PAGE_ID.BILLING, '一卡通支付', LayerECardpayView, attrs, {area: '900px'});
                        }else {
                            _self.openLayer(PAGE_ID.RT_LAYER_ECARD_PAY, PAGE_ID.BILLING_RETURN, '一卡通退款', RTLayerECardPayView, attrs, {area: '900px'});
                        }
                    } else {
                        $('input[name = ecard]').val('');
                        layer.msg(resp.msg, optLayerWarning);
                    }
                } else {
                    $('input[name = ecard]').val('');
                    layer.msg('系统错误，请联系管理员', optLayerError);
                }
            });
        },

        onICEcardManualRead: function(respData) {
            var _self = this;
            var data = {
                type: '02',
                iccardid: respData.cardno,
                msr:'*'
            };
            this.model.getVipInfo(data, function (resp) {
                if (!$.isEmptyObject(resp)) {
                    if (resp.status == '00') {
                        var attrs = {
                            pageid: _self.attrs.pageid,
                            card_id: respData.cardno,
                            cust_id: resp.cust_id,
                            unpaidamount: _self.attrs.unpaidamount,
                            gather_money: _self.attrs.gather_money,
                            goods_detail: _self.attrs.goods_detail,
                            gather_detail: _self.attrs.gather_detail,
                            account_type_code: resp.account_type_code
                        };
                        _self.closeLayer(layerindex);
                        if(_self.attrs.pageid == 6) {
                            _self.openLayer(PAGE_ID.LAYER_ECARD_PAY, PAGE_ID.BILLING, '一卡通支付', LayerECardpayView, attrs, {area: '1000px'});
                        }else {
                            _self.openLayer(PAGE_ID.RT_LAYER_ECARD_PAY, PAGE_ID.BILLING_RETURN, '一卡通退款', RTLayerECardPayView, attrs, {area: '1000px'});
                        }
                    } else {
                        layer.msg(resp.msg, optLayerWarning);
                    }
                }
            });
        }
    });

    return layerECardView;
});
