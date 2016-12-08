/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-ecardlogin/model',
    '../../moduals/layer-ecardpay/view',
    'text!../../moduals/layer-ecardlogin/magcardtpl.html',
    'text!../../moduals/layer-ecardlogin/tpl.html',
], function (BaseLayerView, LayerECardModel, LayerECardpayView, magcardtpl, tpl) {

    var layerECardView = BaseLayerView.extend({

        id: "layerECardView",

        template: tpl,

        template_magcard: magcardtpl,

        type: '03',

        input: 'input[name = magcard]',

        events: {
            'click .cancel': 'onCancelClicked',
        },

        LayerInitPage: function () {
            console.log(this.attrs);
            this.model = new LayerECardModel();
            this.request = new LayerECardModel();
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_ECARD_LOGIN, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_ECARD_LOGIN, KEYS.Enter, function () {
                _self.onOkClicked();
            });
        },

        onCancelClicked: function () {
            if (this.attrs.pageid == 6) {
                $('input[name = billing]').focus();
            } else {
                $('input[name = billingrt]').focus();
            }
            this.closeLayer(layerindex);
        },


        onOkClicked: function () {
            var _self = this;
            var cardId = $('input[name = magcard]').val();
            var data = {};
            data['mobile'] = cardId;
            data['password'] = '*';
            data['type'] = this.type;
            this.request.vipinfo(data, function (resp) {
                if (resp.status == '00') {
                    var attrs = {
                        pageid:PAGE_ID.BILLING,
                        card_id:cardId,
                        cust_id:resp.cust_id,
                        unpaidamount:_self.attrs.unpaidamount,
                        gather_money:_self.attrs.gather_money,
                        goods_detail:storage.get(system_config.SALE_PAGE_KEY,'shopcart'),
                        gather_detail:_self.attrs.gather_detail,
                        account_type_code:resp.account_type_code
                    };
                    _self.closeLayer(layerindex);
                    _self.openLayer(PAGE_ID.LAYER_ECARD_PAY, PAGE_ID.BILLING, '一卡通支付', LayerECardpayView, attrs, {area:'900px'});
                } else {
                    layer.msg(resp.msg, optLayerError);
                }
            });
        },

        /**
         * 刷卡输入
         */
        swipeCard: function () {
            var _self = this;
            var value = $('input[name = magcard]').val();
            if (value == '') {
                //toastr.info('请刷卡');
                layer.msg(resp.msg, optLayerWarning);
                return;
            }
            console.log('value:' + value);
            //var value = ';6222620910021970482=2412220905914925?996222620910021970482=1561560500050006021013000000010000024120===0914925905;';
            var index1, index2, track1, track2, track3;
            //var value = '%768000001 383837934874352?;768000001?;383837934874352?';
            var str = value.charAt(0);
            console.log(str);
            if (str == '%') {
                index1 = value.indexOf('?');
                track1 = value.substring(1, index1);
                value = value.substring(index1 + 1);
                str = value.charAt(0);
                console.log('track1 str:' + str);
            } else {
                track1 = '*';
            }
            //var re = new RegExp(';', 'g');
            //var arr = value.match(re);
            //var len = arr.length;
            //console.log(len);
            if (str == ';') {
                index2 = value.indexOf('?');
                track2 = value.substring(1, index2);
                value = value.substring(index2 + 1);
                str = value.charAt(0);
                console.log('track2 str:' + str);
            } else {
                track2 = '*';
            }
            if (str == ';') {
                track3 = value.substring(1, value.length - 1);
            } else {
                track3 = '*'
            }

            console.log('track1:' + track1 + ',track2:' + track2 + ',track3:' + track3);
            var data = {};
            var tracks = ['track1', 'track2', 'track3'];
            var trackValues = [track1, track2, track3];
            for (var i = 0; i < tracks.length; i++) {
                data[tracks[i]] = trackValues[i];
            }
            data['type'] = this.type;
            this.requestModel.getMemberInfo(data, function (resp) {
                //console.log(resp);
                if (resp.status == '00') {
                    _self.closeLayer(layerindex);
                    //layer.msg('会员登录成功', optLayerSuccess);
                    //$('input[name = main]').focus();
                    //Backbone.trigger('onMemberSigned', resp);
                } else {
                    //toastr.error(resp.msg);
                    layer.msg(resp.msg, optLayerError);
                }
            });
        }
    });

    return layerECardView;
});
