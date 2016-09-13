/**
 * Created by lyting on 16-4-25.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'bootstrap'
], function ($, _, Backbone, Bootstrap) {

    var NewBaseView = Backbone.View.extend({

        attrs: null,

        key_events: {},

        initialize: function (attrs) {
            var _self = this;
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
            $('.modal').on('show.bs.modal', function () {
                $(document).unbind('keyup');
            });
            $('.modal').on('hidden.bs.modal', function () {
                _self.bindKeys();
            });
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

        initPlugins: function () {
        },

        /**
         * 模态框弹出公用方法
         * @param id 弹出的模态框的view的pageid 例如:window.PAGE_ID.MAIN,按需要向status_config里面添加pageid
         * @param view 弹出的模态框中的view
         */
        showModal: function (id, view) {
            pageId = id;
            $('.modal').modal('show');
            $('.modal').on('show.bs.modal', function (e) {
                view.render();
            });
        },

        /**
         * 模态框隐藏公用方法
         * @param id 返回的页面的view的pageid 例如:window.PAGE_ID.MAIN
         */
        hideModal: function (id) {
            $('.modal').modal('hide');
            $('.modal').on('hide.bs.modal', function () {
                pageId = id;
            });
        },

        /**
         * 键盘绑定公用方法
         * @param id 当前view的pageid
         * @param keyCode 将要绑定的键值
         * @param callback 对应将要绑定的回调函数
         */
        // bindKeyEvents: function (id, keyCode, callback) {
        //     $(document).keyup(function (e) {
        //         e = e || window.event;
        //         console.log(e.which);
        //         if (e.which == keyCode && pageId == id) {
        //             callback();
        //         }
        //     });
        // },

        bindKeys: function () {
            var key_mapping = _.extend({
                'Enter': 'enter',
                'Esc': 'escape',
                'Up': 'up',
                'Down': 'down',
                'Left': 'left',
                'Right': 'right'
            }, this.key_events, true);
            console.log(key_mapping);
            // $(document).unbind('keyup');
            var _self = this;
            $(document).bind('keyup', function (e) {

                var _e = e || window.event;
                for (var k in key_mapping) {
                    var _key_code = window.KEYS[k];
                    if (_key_code == _e.which) {
                        // if ($.isFunction(key_mapping[k])) {
                        // key_mapping[k].call(_e);
                        // }
                        var _method = key_mapping[k];
                        if (!_.isFunction(_method)) {
                            _method = _self[_method];
                        }
                        if (_.isFunction(_method)) {
                            _method.call(_e);
                        }
                    }
                }
            });
        },
        enter: function () {

        },
        escape: function () {
            alert("escape");
        },
        up: function () {
            alert("up");
        },
        down: function () {
            alert("down");
        },
        left: function () {
            alert("left");
        },
        right: function () {
            alert("right");
        },
        render: function () {
            var _data = this.collection || this.model;
            var dataset = _data ? _data.toJSON() : {};
            this.$el.html(this.template(dataset));
            this.initPlugins();
            this.bindKeys();
            return this;
        }

    });
    return NewBaseView;

});
