/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/restorder/model',
    '../../../../moduals/restorder/collection',
    '../../../../moduals/keytips-member/view',
    'text!../../../../moduals/restorder/tpl.html',
    'text!../../../../moduals/restorder/restordernumtpl.html',
    'text!../../../../moduals/restorder/restorderdetailtpl.html'
], function (BaseView, RestorderModel, RestorderCollection, KeyTipsView, tpl, restordernumtpl, restorderdetailtpl) {

    var restorderView = BaseView.extend({

        id: "restorderView",

        el: '.views',

        template: tpl,

        template_restordernumtpl: restordernumtpl,

        template_restorderdetailtpl: restorderdetailtpl,

        i: 0,

        orderNum: '',

        isOrdernum: true,

        events: {
            'click .restorder-help': 'onHelpClicked',
            'click .restorder-return': 'onReturnClicked',
            'click .restorder-keyup': 'onKeyUpClicked',
            'click .restorder-keydown': 'onKeyDownClicked',
            'click .restorder-keyright': 'onKeyRightClicked',
            'click .restorder-keyleft': 'onKeyLeftClicked',
            'click .restorder-ok': 'onOKClicked'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.RESTORDER;
            this.collection = new RestorderCollection();
            this.model = new RestorderModel();
            if (storage.isSet(system_config.RESTORDER_KEY)) {
                this.obj = storage.get(window.system_config.RESTORDER_KEY);
            }
            for (var key in this.obj) {
                var item = new RestorderModel();
                item.set({
                    orderNum: key
                });
                this.collection.push(item);
            }
            this.initTemplates();
        },

        initTemplates: function () {
            this.template_restordernumtpl = _.template(this.template_restordernumtpl);
            this.template_restorderdetailtpl = _.template(this.template_restorderdetailtpl);
        },

        initPlugins: function () {
            var _self = this;
            this.initLayoutHeight();
            this.renderRestorder();
            $('#li' + _self.i).addClass('cus-selected');
            $('.for-restordernum-list').perfectScrollbar();
            $('.for-restorderdetail-list').perfectScrollbar();
            _self.listheight = $('.for-restordernum-list').height();//挂单列表高度
            _self.listnum = 9;
            $('.li-num').height(_self.listheight / _self.listnum - 21);

            _self.restorderdetail();
        },

        /**
         * 初始化layout中各个view的高度
         */
        initLayoutHeight: function () {
            var dh = $(window).height();
            var nav = $('.navbar').height();
            var panelheading = $('.panel-heading').height();
            var panelfooter = $('.panel-footer').height();
            var restordernum = dh - nav * 2 - panelheading * 2 - panelfooter;
            var restorderdetail = dh - nav * 2 - panelheading * 2;
            $('.for-restordernum-list').height(restordernum);
            $('.for-restorderdetail-list').height(restorderdetail);
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.RESTORDER, window.KEYS.Esc, function () {
                router.navigate('main', {trigger: true});
            });
            this.bindKeyEvents(window.PAGE_ID.RESTORDER, window.KEYS.T, function () {
                var tipsView = new KeyTipsView('RESTORDER_PAGE');
                _self.showModal(window.PAGE_ID.TIP_MEMBER, tipsView);
            });
            this.bindKeyEvents(window.PAGE_ID.RESTORDER, window.KEYS.Down, function () {
                _self.scrollDown();
            });
            this.bindKeyEvents(window.PAGE_ID.RESTORDER, window.KEYS.Up, function () {
                _self.scrollUp();
            });
            this.bindKeyEvents(window.PAGE_ID.RESTORDER, window.KEYS.Left, function () {
                _self.scrollLeft();
            });

            this.bindKeyEvents(window.PAGE_ID.RESTORDER, window.KEYS.Right, function () {
                _self.scrollRight();
            });

            this.bindKeyEvents(window.PAGE_ID.RESTORDER, window.KEYS.Enter, function () {
                Backbone.trigger('onReleaseOrder', _self.orderSelectedDetail);
                storage.remove(system_config.RESTORDER_KEY, _self.orderNum);
                router.navigate('main', {trigger: true});
                layer.msg('解挂成功', optLayerSuccess);
            });
        },

        renderRestorder: function () {
            this.$el.find('.for-restordernum-list').html(this.template_restordernumtpl(this.collection.toJSON()));
            return this;
        },

        renderRestorderdetail: function () {
            this.$el.find('.for-restorderdetail-list').html(this.template_restorderdetailtpl(this.detailCollection.toJSON()));
            return this;
        },

        restorderdetail: function () {
            var _self = this;
            this.orderNum = $('.cus-selected').data('index');
            this.localObj = storage.get(window.system_config.RESTORDER_KEY);
            _self.detailCollection = new RestorderCollection();
            var orderSelected = _.pick(this.localObj, this.orderNum);
            this.orderSelectedDetail = orderSelected[this.orderNum];
            for (var i in this.orderSelectedDetail) {
                var item = new RestorderModel();
                item.set(this.orderSelectedDetail[i]);
                _self.detailCollection.push(item);
            }
            console.log(_self.detailCollection);
            _self.renderRestorderdetail();
        },
        scrollDown: function () {
            var _self = this;
            if (_self.isOrdernum) {
                if (_self.i < _self.collection.length - 1) {
                    _self.i++;
                }
                if (_self.i % _self.listnum == 0 && _self.n < parseInt(_self.collection.length / _self.listnum)) {
                    _self.n++;
                    $('.for-restordernum-list').scrollTop(_self.listheight * _self.n);
                }
                $('#li' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
                _self.restorderdetail();
            } else {
                if (_self.i < _self.detailCollection.length - 1) {
                    _self.i++;
                }
                if (_self.i % _self.listnum == 0 && _self.n < parseInt(_self.collection.length / _self.listnum)) {
                    _self.n++;
                    //alert(_self.n);
                    $('.for-restorderdetail-list').scrollTop(_self.listheight * _self.n);
                }
                $('#detail' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            }
        },
        scrollUp: function () {
            var _self = this;
            if (_self.isOrdernum) {
                if (_self.i > 0) {
                    _self.i--;
                }
                if ((_self.i + 1) % _self.listnum == 0 && _self.i > 0) {
                    _self.n--;
                    $('.for-restordernum-list').scrollTop(_self.listheight * _self.n);
                }
                $('#li' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
                _self.restorderdetail();
            } else {
                if (_self.i > 0) {
                    _self.i--;
                }
                if ((_self.i + 1) % _self.listnum == 0 && _self.i > 0) {
                    _self.n--;
                    //alert(_self.n);
                    $('.for-restorderdetail-list').scrollTop(_self.listheight * _self.n);
                }
                $('#detail' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            }
        },
        scrollLeft: function () {
            var _self = this;
            $('#detail' + _self.i).removeClass('cus-selected');
            _self.isOrdernum = true;
            _self.i = 0;
            _self.n = 0;
            $('.for-restordernum-list').scrollTop(0);
            $('#li' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            _self.listheight = $('.for-restordernum-list').height();
            _self.itemheight = $('li').height() + 20;
            _self.listnum = parseInt(_self.listheight / _self.itemheight);//商品列表中的条目数
        },
        scrollRight: function () {
            var _self = this;
            _self.isOrdernum = false;
            _self.i = 0;
            _self.n = 0;
            $('#detail' + _self.i).addClass('cus-selected');
            _self.listheight = $('.for-restorderdetail-list').height();
            _self.itemheight = $('li').height() + 20;
            _self.listnum = parseInt(_self.listheight / _self.itemheight);//商品列表中的条目数
        },
        onHelpClicked: function () {
            var tipsView = new KeyTipsView('RESTORDER_PAGE');
            this.showModal(window.PAGE_ID.TIP_MEMBER, tipsView);
        },

        onOKClicked: function () {
            Backbone.trigger('onReleaseOrder', this.orderSelectedDetail);
            storage.remove(system_config.RESTORDER_KEY, this.orderNum);
            router.navigate('main', {trigger: true});
            layer.msg('解挂成功', optLayerSuccess);
        },

        onReturnClicked: function () {
            router.navigate('main', {trigger: true});
        },
        onKeyUpClicked: function () {
            this.scrollUp();
        },
        onKeyDownClicked: function () {
            this.scrollDown();
        },
        onKeyRightClicked: function () {
            this.scrollRight();
        },
        onKeyLeftClicked: function () {
            this.scrollLeft();
        }


    });

    return restorderView;
});