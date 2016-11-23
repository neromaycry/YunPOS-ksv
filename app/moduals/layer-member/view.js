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

        type: '03',

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
                  case '01':
                      this.$el.find('.for-member-login').html(this.template_magcard(this.model.toJSON()));
                      return this;
                      break;
                  case '03':
                      this.$el.find('.for-member-login').html(this.template_phone(this.model.toJSON()));
                      $('.cbtn').mousedown(function () {
                          console.log('baselayer mousedown');
                          $(this).addClass('clicked');
                      });
                      $('.cbtn').mouseup(function () {
                          $(this).removeClass('clicked');
                      });
                      $('.cbtn').on('touchstart', function (e) {
                          $(this).addClass('clicked');
                      });
                      $('.cbtn').on('touchend', function (e) {
                          $(this).removeClass('clicked');
                      });
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
                _self.changeTemplate(1);
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_MEMBER, KEYS.P, function () {
                _self.changeTemplate(3);
            });
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
            str = str.substring(0, str.length-1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

        onOKClicked: function (type) {
            switch (type) {
                case '01':
                    console.log('会员卡登录');
                    toastr.warning('请刷卡');
                    break;
                case '03':
                    console.log('手机号登陆');
                    this.inputPhoneNum();
                    break;
            }
        },

        inputPhoneNum: function () {
            var _self = this;
            var phoneNum = $('input[name = phone]').val();
            if (phoneNum == '') {
                //toastr.error('手机号不能为空');
                layer.msg('手机号不能为空', optLayerError);
                return;
            }
            if (!(/^1[34578]\d{9}$/.test(phoneNum))) {
                //toastr.error('手机号输入错误，请重填');
                layer.msg('手机号输入错误，请重填', optLayerError);
                $('input[name = phonenum]').val('');
                return;
            }
            var data = {};
            data['mobile'] = phoneNum;
            data['password'] = '*';
            data['type'] = this.type;
            this.model.getMemberInfo(data, function (resp) {
                if (resp.status == '00') {
                    _self.closeLayer(layerindex);
                    layer.msg('会员登录成功', optLayerSuccess);
                    $('input[name = main]').focus();
                    Backbone.trigger('onMemberSigned', resp);
                } else {
                    //toastr.error(resp.msg);
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
            //if (value == '') {
            //    //toastr.info('请刷卡');
            //    layer.msg('请刷卡', optLayerWarning);
            //    return;
            //}
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
            for (var i = 0;i < tracks.length;i++) {
                data[tracks[i]] = trackValues[i];
            }
            data['type'] = this.type;
            this.model.getMemberInfo(data, function (resp) {
                //console.log(resp);
                if (resp.status == '00') {
                    _self.closeLayer(layerindex);
                    layer.msg('会员登录成功', optLayerSuccess);
                    $('input[name = main]').focus();
                    Backbone.trigger('onMemberSigned', resp);
                } else {
                    //toastr.error(resp.msg);
                    $(_self.input).val('');
                    layer.msg(resp.msg, optLayerError);
                }
            });
        },

        onLoginListClicked: function (e) {
            var index = $(e.currentTarget).data('index');
            console.log(index);
            this.changeTemplate(index);
        },

        changeTemplate: function (index) {
            var _self = this;
            switch (index) {
                case 1:
                    this.type = '01';
                    this.input = 'input[name = magcard]';
                    this.renderByType(this.type);
                    $('input[name = magcard]').koala({
                        delay: 2000,
                        keyup: function (event) {
                            _self.swipeCard();
                        }
                    });
                    break;
                case 3:
                    this.type = '03';
                    this.input = 'input[name = phone]';
                    this.renderByType(this.type);
                    break;
            }
            $(this.input).focus();
        }
    });

    return layerMemberView;
});