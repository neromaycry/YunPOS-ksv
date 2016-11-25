/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseModel'], function (BaseModel) {

    var ecardModel = BaseModel.extend({

        defaults: {},

        vipinfo: function (data, callback) {
            this.sendPOST({
                url: window.API_URL.VIPINFO,
                data: data,
                success: callback
            });
        },

    });
    return ecardModel;
});