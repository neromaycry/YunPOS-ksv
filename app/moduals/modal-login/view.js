/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-login/model',
    '../../moduals/modal-login/collection',
    'text!../../moduals/modal-login/tpl.html',
], function (BaseModalView,SecondloginModel,SecondloginCollection, tpl) {

    var secondloginView = BaseModalView.extend({

        id: "secondloginView",

        template: tpl,

        modalInitPage: function () {

        },

        bindModalKeys: function () {
            console.log('bind modal keys');
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.SECONDLOGIN, window.KEYS.Esc, function () {
                _self.hideModal(window.PAGE_ID.MAIN);
            });
        },


        hideModal: function (id) {

        }

    });

    return secondloginView;
});