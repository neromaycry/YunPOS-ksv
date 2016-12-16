/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseModel'], function (BaseModel) {

    var layerWithdrawModel = BaseModel.extend({

        defaults: {
            name: ''
        },

        getPrintContent: function (data, callback) {
            this.sendPOST({
                url: API_URL.CASHIER_MONEY,
                data: data,
                success: callback
            })
        }


    });
    return layerWithdrawModel;
});