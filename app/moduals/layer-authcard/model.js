/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseModel'], function (BaseModel) {

    var layerAuthCardModel = BaseModel.extend({

        defaults: {},

        authAccess: function (data, callback) {
            this.sendPOST({
                url: window.API_URL.VIPINFO,
                data: data,
                success: callback
            });
        },

    });
    return layerAuthCardModel;
});