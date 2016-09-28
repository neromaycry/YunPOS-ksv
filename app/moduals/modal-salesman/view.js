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

        input: 'input[name = salesman_id]',

        events:{
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked'
        },


        modalInitPage: function () {
            var _self = this;
            this.model = new SalesmanModel();
            this.collection = new SalesmanCollection();
            this.collection.fetch({
                success: function (collection,resp) {
                    console.log(collection);
                    _self.collection.set(collection.toJSON());
                }
            });
        },
        onCancelClicked: function () {
            this.hideModal(window.PAGE_ID.MAIN);
        },

        onNumClicked: function (e) {
            var value = $(e.currentTarget).data('num');
            var str = $(this.input).val();
            str += value;
            $(this.input).val(str);
        },

        onBackspaceClicked: function (e) {
            var str = $(this.input).val();
            str = str.substring(0, str.length-1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

        onOKClicked: function () {
            this.onSalesmanLogin();
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.SALESMAN, window.KEYS.Enter, function () {
                _self.onSalesmanLogin();
            });
            this.bindModalKeyEvents(window.PAGE_ID.SALESMAN, window.KEYS.Esc, function () {
                _self.hideModal(window.PAGE_ID.MAIN);
                $('input[name = main]').focus();
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
        /**
         * 销售人员登录事件
         */
        onSalesmanLogin: function () {
            var n = 0;
            var search = $('#salesman_id').val();
            if(search != ''){
                for(var i=0;i<this.collection.length;i++){
                    n++;
                    if(search == this.collection.at(i).get("number")) {
                        this.hideModal(window.PAGE_ID.MAIN);
                        toastr.success('营业员' + search + '登录成功');
                        var attrData = {};
                        attrData['name'] = this.collection.at(i).get("name");
                        Backbone.trigger('SalesmanAdd',attrData);
                        $('input[name = main]').focus();
                        break;
                    }
                }
                if(n == this.collection.length){
                    toastr.warning('您输入的营业员不存在,请重新输入');
                    n = 0;
                }
            }else{
                toastr.warning('您输入的营业员编号为空');
            }
            $('#salesman_id').val('');
        }

    });

    return salesmanView;
});