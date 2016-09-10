/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseView',
    '../../moduals/salesman/model',
    '../../moduals/salesman/collection',
    'text!../../moduals/salesman/tpl.html',
], function (BaseView,SalesmanModel,SalesmanCollection, tpl) {

    var salesmanView = Backbone.View.extend({

        id: "salesmanView",

        el: '.modal',

        template: tpl,

        initialize: function () {
            var _self = this;
            console.log('initialize');
            if (this.template) {
                this.template = _.template(this.template);
            }
            _self.collection = new SalesmanCollection();
            _self.collection.fetch({
                success: function (collection,resp) {
                    console.log(collection);
                    _self.collection.set(collection.toJSON());
                }
            });
            this.bindModalKeys();
            this.render();
        },

        bindModalKeys: function () {
            console.log('bind modal keys');
            var _self = this;
            var n = 0;
            this.bindKeyEvents(window.PAGE_ID.SALESMAN, window.KEYS.Enter, function () {
                var search = $('#salesman_id').val()
                if(search != ''){
                    for(var i=0;i<_self.collection.length;i++){
                        n++;
                        if(search == _self.collection.at(i).get("number")){
                            _self.hideModal(window.PAGE_ID.MAIN);
                            toastr.success('营业员' + search + '登录成功');
                            var attrData = {};
                            attrData['name'] = _self.collection.at(i).get("name");
                            Backbone.trigger('SalesmanAdd',attrData);
                            break;
                        }
                    }
                    if(n == _self.collection.length){
                        toastr.warning('您输入的营业员不存在,请重新输入');
                        n = 0;
                    }
                }else{
                    toastr.warning('您输入的营业员编号为空');
                }


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