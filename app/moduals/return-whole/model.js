/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseModel'], function (BaseModel) {

    var returnWholeModel = BaseModel.extend({

        getOrderInfo: function (data, callback) {
            this.sendPOST({
                url: window.API_URL.REFUND,
                data: data,
                success: callback
            });
        }

    });
    return returnWholeModel;
});