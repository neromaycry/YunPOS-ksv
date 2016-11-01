/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-ecardlogin/model',
    '../../moduals/modal-ecardlogin/collection',
    '../../moduals/modal-ecardpay/view',
    'text!../../moduals/modal-ecardlogin/tpl.html',
], function (BaseModalView,EcardModel,EcardCollection,EcardpayView, tpl) {

    var ecardView = BaseModalView.extend({

        id: "ecardView",

        template: tpl,

        isCardLogin:false,

        dataindex:0,

        input:'input[name = medium_id]',

        events:{
            'click .cancel':'onCancelClicked',
            'click .ok':'onOkClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
            'click .keyup':'onKeyUp',
            'click .keydown':'onKeyDown',
            'click input[name = medium_id]':'focusInputUser',
            'click input[name = medium_password]':'focusInputPasswd',

        },

        modalInitPage: function () {
            this.model = new EcardModel();
            this.request = new EcardModel();
            this.collection = new EcardCollection();
            this.temp = new EcardCollection();
        },


        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.ONECARD_LOGIN, window.KEYS.Esc , function () {
                _self.hideModal(window.PAGE_ID.BILLING);
                $('input[name = billing]').focus();
            });
            this.bindModalKeyEvents(window.PAGE_ID.ONECARD_LOGIN, window.KEYS.Down, function() {
                _self.scrollDown();
            });
            this.bindModalKeyEvents(window.PAGE_ID.ONECARD_LOGIN, window.KEYS.Up, function() {
                _self.scrollUp();
            });
            this.bindModalKeyEvents(window.PAGE_ID.ONECARD_LOGIN, window.KEYS.Enter, function(){
                var isUserFocused = $('input[name = medium_id]').is(':focus');
                if (isUserFocused) {
                    $('input[name = medium_password]').focus();
                } else {
                    _self.doLogin();
                }
            });
            this.bindModalKeyEvents(window.PAGE_ID.ONECARD_LOGIN, window.KEYS.Right, function() {
                _self.isCardLogin = true;
                $('#licard0').addClass('cus-selected');
            });
            this.bindModalKeyEvents(window.PAGE_ID.ONECARD_LOGIN, window.KEYS.Left, function () {
                _self.isCardLogin = false;
            });
        },


        bindModalKeyEvents: function (id,keyCode,callback) {
            $(document).keydown(function (e) {
                e = e || window.event;
                console.log(e.which);
                if(e.which == keyCode && pageId == id) {
                    callback();
                }
            });
        },

        /**
         * 方向向上
         */
        scrollUp:function(){
            if(this.isCardLogin){
                if(this.dataindex > 0){
                    this.dataindex--;
                    $('#licard' + this.dataindex).addClass('cus-selected').siblings().removeClass('cus-selected');
                }
            }else{
                var isUserFocused = $('input[name = medium_id]').is(':focus');
                if(isUserFocused){
                    $('input[name = medium_password]').focus();
                }else{
                    $('input[name = medium_id]').focus();
                }
            }
        },

        /**
         * 方向向下
         */
        scrollDown:function () {
            if(this.isCardLogin){
                if(this.dataindex < 3){
                    this.dataindex++;
                    $('#licard' + this.dataindex).addClass('cus-selected').siblings().removeClass('cus-selected');
                }
            }else {
                var isUserFocused = $('input[name = medium_id]').is(':focus');
                if(isUserFocused){
                    $('input[name = medium_password]').focus();
                }else{
                    $('input[name = medium_id]').focus();
                }
            }
        },

        /**
         * 确认事件
         */
        doLogin:function() {
            var _self = this;
            var isUserFocused = $('input[name = medium_id]').is(':focus');
            if(isUserFocused){
                $('input[name = medium_password]').focus();
            } else {
                var cardid = $('input[name = medium_id]').val();
                var password = $('input[name = medium_password]').val();
                if(cardid == '' || password == ''){
                    toastr.warning('会员卡号或者密码不能为空');
                }
                if(cardid != '' && password != ''){
                    var data = {};
                    data['cardid'] = cardid;
                    data['password'] = password;
                    data['type'] = '00';
                    _self.request.vipinfo(data,function(resp) {
                        if(resp.status == '00'){
                            var dataAccount = {};
                            dataAccount['unpaidamount'] = _self.attrs.unpaidamount;
                            dataAccount['receivedsum'] = _self.attrs.receivedsum;
                            dataAccount['card_id'] = cardid;
                            dataAccount['cust_id'] = resp.cust_id;
                            dataAccount['goods_detail'] = storage.get(system_config.SALE_PAGE_KEY,'shopcart');
                            dataAccount['gather_detail'] = storage.get(system_config.GATHER_KEY);
                            $('.modal-backdrop').remove();
                            _self.hideModal(window.PAGE_ID.BILLING);
                            this.ecardpayview = new EcardpayView(dataAccount);
                            _self.showModal(window.PAGE_ID.ONECARD_PAY,_self.ecardpayview);

                        }else{
                            toastr.error(resp.msg);
                        }
                    });

                    $('input[name = medium_id]').val("");
                    $('input[name = medium_password]').val("");
                }
            }
        },

        onCancelClicked: function () {
            this.hideModal(window.PAGE_ID.BILLING);
        },

        onOkClicked: function () {
            var isUserFocused = $('input[name = medium_id]').is(':focus');
            if (isUserFocused) {
                $('input[name = medium_password]').focus();
            } else {
                this.doLogin();
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
            str = str.substring(0, str.length-1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

        onKeyUp:function (){
            this.scrollUp();
        },
        onKeyDown:function (){
            this.scrollDown();
        },
        focusInputUser: function () {
            this.input = 'input[name = medium_id]';
        },

        focusInputPasswd: function () {
            this.input = 'input[name = medium_password]';
        }



    });

    return ecardView;
});
