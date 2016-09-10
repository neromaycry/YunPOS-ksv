/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseView',
    'text!../../moduals/salesman/tpl.html',
], function (BaseView, tpl) {

    var salesmanView = Backbone.View.extend({

        id: "salesmanView",

        el: '.modal',

        template: tpl,

        initialize: function () {
            console.log('initialize');
            if (this.template) {
                this.template = _.template(this.template);
            }
            this.bindModalKeys();
            this.render();
        },

        bindModalKeys: function () {
            console.log('bind modal keys');
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.SALESMAN, window.KEYS.Enter, function () {
                _self.hideModal(window.PAGE_ID.MAIN);
            });
        },

        bindKeyEvents: function (id,keyCode,callback) {
            $(document).keyup(function (e) {
                e = e || window.event;
                console.log(e.which);
                if(e.which == keyCode && pageId == id) {
                    callback();
                }
            });
        },

        hideModal: function (id) {
            pageId = id;
            $('.modal').modal('hide');
        },

        render: function () {
            this.$el.html(this.template(this.model));
            return this;
        }


    });

    return salesmanView;
});