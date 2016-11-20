/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-binstruction/model',
    '../../moduals/modal-binstruction/collection',
    'text!../../moduals/modal-binstruction/tpl.html',
], function (BaseModalView,BinstructionModel,BinstructionCollection, tpl) {

    var binstructionView = BaseModalView.extend({

        id: "binstructionView",

        template: tpl,

        events:{
        },


        modalInitPage: function () {

        },

        onCancelClicked: function () {
            if(this.attrs.pageid == window.PAGE_ID.MAIN) {
                this.hideModal(window.PAGE_ID.MAIN);
                $('input[name = main]').focus();
            }else {
                this.hideModal(window.PAGE_ID.BILLING);
                $('input[name = billing]').focus();
            }
        },


        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.MODAL_BANK_INSTRUCTION, window.KEYS.Enter, function () {
               _self.confirm();
            });
            this.bindModalKeyEvents(window.PAGE_ID.MODAL_BANK_INSTRUCTION, window.KEYS.Esc, function () {
                if(_self.attrs.pageid == window.PAGE_ID.MAIN) {
                    _self.hideModal(window.PAGE_ID.MAIN);
                    $('input[name = main]').focus();
                }else {
                    _self.hideModal(window.PAGE_ID.BILLING);
                    $('input[name = billing]').focus();
                }
            });
        },

        bindModalKeyEvents: function (id,keyCode,callback) {
            $(document).keydown(function (e) {
                var e = e || window.event;
                console.log(e.which);
                if(e.which == keyCode && pageId == id) {
                    callback();
                }
            });
        },

    });

    return binstructionView;
});