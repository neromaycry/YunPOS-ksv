/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseModel'], function (BaseModel) {

    var layerWithdrawModel = BaseModel.extend({

        defaults: {
            name: ''
        },

    });
    return layerWithdrawModel;
});