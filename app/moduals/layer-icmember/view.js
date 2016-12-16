/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-icmember/model',
    'text!../../moduals/layer-icmember/tpl.html',
], function (BaseLayerView, LayerICMemberModel, tpl) {

    var layerICMemberView = BaseLayerView.extend({

        id: "layerICMemberView",

        template: tpl,

        response: null,

        events: {
            'click .cancel': 'onCancelClicked',
            'click .ok': 'onOKClicked',
        },

        LayerInitPage: function () {
            var _self = this;
            this.model = new LayerICMemberModel();
            var data = {
                type: '02',
                iccardid: this.attrs.card_no,
                msr:'*'
            };
            this.model.doMemberLogin(data, function (resp) {
                console.log(resp);
                if (!$.isEmptyObject(resp)) {
                    if (resp.status == '00') {
                        _self.renderMember(resp);
                        _self.response = resp;
                    } else {
                        layer.msg(resp.msg, optLayerWarning);
                    }
                } else {
                    layer.msg('服务器错误，请联系管理员', optLayerError);
                }
            });
        },

        renderMember: function (resp) {
            this.$el.html(this.template(resp));
            return this;
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_ICMEMBER, KEYS.Enter, function () {
                _self.onOKClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_ICMEMBER, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
        },

        onCancelClicked: function () {
            this.confirmHideLayer(this.attrs.pageid);
        },

        onOKClicked: function () {
            var _self = this;
            if (this.response) {
                if (this.attrs.isEcardpay) {
                    this.response = _.extend(this.response, {
                        unpaidamount: _self.attrs.unpaidamount,
                        gather_money: _self.attrs.gather_money,
                        goods_detail: _self.attrs.goods_detail,
                        gather_detail: _self.attrs.gather_detail
                    });
                }
                this.attrs.callback(this.response);
                this.confirmHideLayer(this.attrs.pageid);
                layer.msg('会员登录成功', optLayerSuccess);
            } else {
                layer.msg('正在加载会员信息，请稍等...', optLayerWarning);
            }
        },

    });

    return layerICMemberView;
});