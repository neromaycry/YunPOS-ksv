/**
 * Created by gjwlg on 2016/9/11.
 */
define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {

    var BaseModalView = Backbone.View.extend({

        el: '.modal',

        initialize: function () {
            console.log('modal:' + this.id);
            $(document).unbind('keydown');
            if (this.template) {
                this.template = _.template(this.template);
            }
            this.modalInitPage();
            this.bindModalKeys();
            this.render();
        },

        modalInitPage: function () {

        },

        bindModalKeys: function () {

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

        hideModal: function (id) {
            pageId = id;
            $('.modal').modal('hide');
        },

        render: function () {
            this.$el.html(this.template(this.model));
            return this;
        }

    });

    return BaseModalView;
});