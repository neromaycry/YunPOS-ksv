/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-member/model',
    'text!../../moduals/layer-member/tpl.html',
], function (BaseLayerView, LayerMemberModel, tpl) {

    var layerMemberView = BaseLayerView.extend({

        id: "layerMemberView",

        template: tpl,

        input: 'input[name = salesman_id]',

        LayerInitPage: function () {
            this.model = new LayerMemberModel();
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_MEMBER, KEYS.Enter, function () {
                _self.enter();
            });

            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_MEMBER, KEYS.Esc, function () {
                _self.esc();
            });
        },

        enter: function () {
            console.log('enter clicked');
            this.closeLayer(layerindex);
        },

        esc: function () {
            console.log('esc cliked');
            this.closeLayer(layerindex);
        }



    });

    return layerMemberView;
});