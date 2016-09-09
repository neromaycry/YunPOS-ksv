/**
 * Created by lyting on 16-4-25.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'bootstrap'
], function ($, _, Backbone,Bootstrap) {

    var BaseView = Backbone.View.extend({

        attrs: null,

        is_modal_open:false,

        initialize: function (attrs) {
            console.log(">>> " + this.id);
            this.undelegateEvents();
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

            this.initRouter();

            this.pageInit();
            this.stopListening();
            if (this.model) {
                // 注册 model change事件
                this.listenTo(this.model, "change", this.model_change);
            }
            if (this.collection) {
                // 注册 collection add remove reset 事件
                this.listenTo(this.collection, "add", this.collection_add);
                this.listenTo(this.collection, "remove", this.collection_remove);
                this.listenTo(this.collection, "reset", this.collection_reset);
            }
            this.delegateEvents();
        },

        initRouter: function () {

        },

        pageInit: function () {
        },

        model_change: function () {

        },
        collection_add: function () {

        },
        collection_remove: function () {

        },
        collection_reset: function () {

        },

        initOtherView: function () {

        },

        initPlugins: function () {

        },

        bindKeyEvents: function (id,keyCode,callback) {
            $(document).keypress(function (e) {
                if(e.keyCode == keyCode && pageId == id) {
                    callback();
                }
            });
        },

        render: function () {
            console.log('render');
            console.log(this.template);
            var _data = this.collection || this.model;
            var dataset = _data ? _data.toJSON() : {};
            this.$el.html(this.template(dataset));
            this.initOtherView();
            this.initPlugins();
            return this;
        }

    });
    return BaseView;

});
