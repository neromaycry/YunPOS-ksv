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

        attrs:null,

        initialize: function (attrs) {
            console.log('modal:' + this.id);
            //$(document).unbind('keyup');
            $(document).unbind('keydown');
            this.$el.empty().off();
            if (attrs) {
                this.attrs = attrs;
            }
            if (this.model) {
                this.collection = new Backbone.Collection.extend({model: this.model});
            }
            if (this.template) {
                this.$el.html(this.template);
                this.template = _.template(this.template);
            }
            this.modalInitPage();
            this.bindModalKeys();
        },

        modalInitPage: function () {

        },

        onModalShown: function () {
            
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
            $('.modal').modal('hide');
            $('.modal').on('hidden.bs.modal', function () {
                pageId = id;
            });
        },

        render: function () {
            console.log('modal render');
            this.$el.html(this.template(this.model.toJSON()));
            this.onModalShown();
            return this;
        }

    });

    return BaseModalView;
});