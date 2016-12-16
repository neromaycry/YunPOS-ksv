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
            'click .cancel': 'onCancelClicked',
            'click .ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked',
            'click [data-index]': 'onLoginListClicked',

        },

        input: 'input[name = phone]',

        LayerInitPage: function () {
            var _self = this;
            this.initTemplates();
            this.model = new LayerMemberModel();
            setTimeout(function () {
                _self.renderByType(_self.type);
            }, 100);
            this.handleEvents();
        },

        initTemplates: function () {
            this.template_phone = _.template(this.template_phone);
            this.template_magcard = _.template(this.template_magcard);
        },

        handleEvents: function () {
            Backbone.off('onICManualRead');
            Backbone.on('onICManualRead', this.onICManualRead, this);
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
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_MEMBER, KEYS.I, function () {
                _self.changeTemplate(2);
            });
            this.bindLayerKeyEvents(PAGE_ID.LAYER_MEMBER, KEYS.Up, function () {
                if (_self.type == '03') {
                    var isUserFocused = $('input[name = phone]').is(':focus');
                    if (isUserFocused) {
                        $('input[name = passwd]').focus();
                        _self.input = 'input[name = passwd]';
                    } else {
                        $('input[name = phone]').focus();
                        _self.input = 'input[name = phone]';
                    }
                }
            });
            this.bindLayerKeyEvents(PAGE_ID.LAYER_MEMBER, KEYS.Down, function () {
                if (_self.type == '03') {
                    var isUserFocused = $('input[name = phone]').is(':focus');
                    if (isUserFocused) {
                        $('input[name = passwd]').focus();
                        _self.input = 'input[name = passwd]';
                    } else {
                        $('input[name = phone]').focus();
                        _self.input = 'input[name = phone]';
                    }
                }
            });

        },

        onCancelClicked: function () {
            this.closeLayer(layerindex);
            if(this.attrs.pageid == 2) {
                $('input[name = main]').focus();
            } else {
                $('input[name = whole_return_order]').focus();
            }

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
            switch (this.type) {
                case '01':
                    console.log('会员卡登录');
                    toastr.warning('请刷卡');
                    break;
                case '03':
                    console.log('手机号登陆');
                    this.inputPhoneNum();
                    //var isUserFocused = $('input[name = phone]').is(':focus');
                    //if (isUserFocused) {
                    //    $('input[name = passwd]').focus();
                    //    this.input = 'input[name = passwd]';
                    //} else {
                    //    this.inputPhoneNum();
                    //}
                    break;
            }
        },

        focusInputUser: function () {
            this.input = 'input[name = phone]';
        },

        focusInputPasswd: function () {
            this.input = 'input[name = passwd]';
        },

        inputPhoneNum: function () {
            var _self = this;
            var phoneNum = $('input[name = phone]').val();
            var passwd = $('input[name = passwd]').val();
            if (passwd == '') {
                passwd = '*';
            }
            if (phoneNum == '') {
                layer.msg('手机号不能为空', optLayerError);
                return;
            }
            if (!(/^1[34578]\d{9}$/.test(phoneNum))) {
                layer.msg('手机号输入错误，请重填', optLayerError);
                $('input[name = phonenum]').val('');
                return;
            }
            var data = {};
            data['mobile'] = phoneNum;
            data['password'] = passwd;
            data['type'] = this.type;
            this.model.getMemberInfo(data, function (resp) {
                if (resp.status == '00') {
                    _self.closeLayer(layerindex);
                    layer.msg('会员登录成功', optLayerSuccess);
                    if(_self.attrs.pageid == 2) {
                        $('input[name = main]').focus();
                        Backbone.trigger('onMemberSigned', resp);
                    } else {
                        $('input[name = whole_return_order]').focus();
                        Backbone.trigger('onRTMemberSigned', resp);
                    }

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
            if (!value) {
                return;
            }
            if (value == 'p') {
                return;
            }
            var data = {};
            var tracks = ['track1', 'track2', 'track3'];
            var trackValues = this.parseMagTracks(value);
            for (var i = 0; i < tracks.length; i++) {
                data[tracks[i]] = trackValues[i];
            }
            data['type'] = this.type;
            this.model.getMemberInfo(data, function (resp) {
                if (resp.status == '00') {
                    _self.closeLayer(layerindex);
                    layer.msg('会员登录成功', optLayerSuccess);
                    $('input[name = main]').focus();
                    Backbone.trigger('onMemberSigned', resp);
                } else {
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
                case 2:
                    this.sendWebSocketDirective([DIRECTIVES.IC_CARD_MANUAL_READ], [''], wsClient);
                    break;
                case 3:
                    this.type = '03';
                    this.input = 'input[name = phone]';
                    this.renderByType(this.type);
                    break;
            }
            $(this.input).focus();
        },

        /**
         * IC卡手动读取监听事件
         * @param respData websocket返回的数据
         */
        onICManualRead: function(respData) {
            var _self = this;
            var data = {
                type: '02',
                iccardid: respData.cardno,
                msr:'*'
            };
            this.model.getMemberInfo(data, function (resp) {
                if (!$.isEmptyObject(resp)) {
                    if (resp.status == '00') {
                        _self.closeLayer(layerindex);
                        layer.msg('会员登录成功', optLayerSuccess);
                        $('input[name = main]').focus();
                        Backbone.trigger('onMemberSigned', resp);
                    } else {
                        layer.msg(resp.msg, optLayerError);
                    }
                }
            });
        }

    });

    return layerMemberView;
});