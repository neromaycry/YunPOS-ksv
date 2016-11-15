/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-phonenum/model',
    'text!../../moduals/modal-phonenum/contenttpl.html',
    'text!../../moduals/modal-phonenum/tpl.html'
], function (BaseModalView, PhoneNumModel, contenttpl, tpl) {

    var mPhoneView = BaseModalView.extend({

        id: "mPhoneView",

        template: tpl,

        template_content:contenttpl,

        events: {
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked'
        },

        modalInitPage: function () {
            this.requestModel = new PhoneNumModel();
            $('.modal').on('shown.bs.modal', function () {
                $('input[name = phonenum]').focus();
            });
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.MODAL_PHONENUM, window.KEYS.Esc , function () {
                _self.hideModal(window.PAGE_ID.MEMBER);
                //$('input[name = custid]').focus();
            });
            this.bindModalKeyEvents(window.PAGE_ID.MODAL_PHONENUM, window.KEYS.Enter, function () {
                _self.inputPhoneNum();
                //$('input[name = custid]').focus();
            });
        },

        /**
         * 刷卡输入
         */
        inputPhoneNum: function () {
            var _self = this;
            var phoneNum = $('input[name = phonenum]').val();
            if (phoneNum == '') {
                toastr.error('手机号不能为空');
                return;
            }
            if (!(/^1[34578]\d{9}$/.test(phoneNum))) {
                toastr.error('手机号输入错误，请重填');
                $('input[name = phonenum]').val('');
                return;
            }
            var data = {};
            data['mobile'] = phoneNum;
            data['password'] = '*';
            data['type'] = '03';
            this.requestModel.getMemberInfo(data, function (resp) {
                 if (resp.status == '00') {
                     _self.hideModal(window.PAGE_ID.MEMBER);
                     Backbone.trigger('onPhoneNumResponse', resp);
                 } else {
                     toastr.error(resp.msg);
                 }
            });
        },

        onOKClicked: function () {
            this.inputPhoneNum();
            //$('input[name = custid]').focus();
        },

        onCancelClicked: function () {
            this.hideModal(window.PAGE_ID.MEMBER);
            //$('input[name = custid]').focus();
        }

    });

    return mPhoneView;
});