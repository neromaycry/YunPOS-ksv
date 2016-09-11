/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-salesman/model',
    '../../moduals/modal-salesman/collection',
    'text!../../moduals/modal-salesman/tpl.html',
], function (BaseModalView,SalesmanModel,SalesmanCollection, tpl) {

    var salesmanView = BaseModalView.extend({

        id: "salesmanView",

        template: tpl,

        modalInitPage: function () {
            var _self = this;
            _self.collection = new SalesmanCollection();
            _self.collection.fetch({
                success: function (collection,resp) {
                    console.log(collection);
                    _self.collection.set(collection.toJSON());
                }
            });
        },

        bindModalKeys: function () {
            console.log('bind modal keys');
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.SALESMAN, window.KEYS.Enter, function () {
                var n = 0;
                var search = $('#salesman_id').val();
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
            this.bindModalKeyEvents(window.PAGE_ID.SALESMAN, window.KEYS.Esc, function () {
                _self.hideModal(window.PAGE_ID.MAIN);
            });
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
        }

    });

    return salesmanView;
});