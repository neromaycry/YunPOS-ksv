/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-member/model',
    'text!../../moduals/layer-member/phonetpl.html',
    'text!../../moduals/layer-member/magcardtpl.html',
    'text!../../moduals/layer-member/tpl.html',
], function (BaseLayerView, LayerMemberModel, phonetpl, magcardtpl, tpl) {

    var layerMemberView = BaseLayerView.extend({

        id: "layerMemberView",

        template: tpl,

        template_phone: phonetpl,

        template_magcard: magcardtpl,

        type: '01',

        events: {
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
            'click [data-index]':'onLoginListClicked',

        },

        input: 'input[name = phone]',

        LayerInitPage: function () {
            var _self = this;
            this.initTemplates();
            this.model = new LayerMemberModel();
            setTimeout(function () {
                _self.renderByType(_self.type);
            }, 100);
        },

        initTemplates: function () {
            this.template_phone = _.template(this.template_phone);
            this.template_magcard = _.template(this.template_magcard);
        },

        renderByType: function (type) {
            console.log(type);
              switch (type) {
                  case '00':
                      this.$el.find('.for-member-login').html(this.template_magcard(this.model.toJSON()));
                      return this;
                      break;
                  case '01':
                      this.$el.find('.for-member-login').html(this.template_phone(this.model.toJSON()));
                      return this;
                      break;
              }
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_MEMBER, KEYS.Enter, function () {
                _self.onOKClicked(_self.type);
            });

            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_MEMBER, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_MEMBER, KEYS.X, function () {
                _self.changeTemplate(0);
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_MEMBER, KEYS.P, function () {
                _self.changeTemplate(1);
            });
        },

        onCancelClicked: function () {
            this.closeLayer(layerindex);
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

        onOKClicked: function (type) {
            switch (type) {
                case '00':
                    console.log('会员卡登录');
                    this.closeLayer(layerindex);
                    break;
                case '01':
                    console.log('手机号登陆');
                    this.closeLayer(layerindex);
                    break;
            }
        },

        onLoginListClicked: function (e) {
            var index = $(e.currentTarget).data('index');
            console.log(index);
            this.changeTemplate(index);
        },

        changeTemplate: function (index) {
            switch (index) {
                case 0:
                    this.type = '00';
                    this.input = 'input[name = magcard]';
                    break;
                case 1:
                    this.type = '01';
                    this.input = 'input[name = phone]';
                    break;
            }
            this.renderByType(this.type);
            $(this.input).focus();
        }


    });

    return layerMemberView;
});