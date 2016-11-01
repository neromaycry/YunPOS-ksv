/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/hconnection/model',
    '../../../../moduals/hconnection/collection',
    'text!../../../../moduals/hconnection/tpl.html',
], function (BaseView, HModel, HCollection , tpl) {

    var hView = BaseView.extend({

        id: "loginView",

        el: '.views',

        template: tpl,

        events: {
            'click .back':'onBackClicked',
            'click #bbpos':'onBBposClicked',
            'click #powa-tscanner':'onTscannerClicked'
        },

        pageInit: function () {

        },

        initPlugins: function () {

        },

        onBBposClicked: function () {

        },

        onTscannerClicked: function () {

        },

        onBackClicked: function () {
            router.navigate('main', { trigger:true });
        }


    });

    return hView;
});