/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseModel'], function (BaseModel) {

    var layerPayTableModel = BaseModel.extend({

        defaults: {

        },

        printPayTable: function(data, callback) {
            this.sendPOST({
                url: API_URL.CASHIER_DKDJ,
                data: data,
                success: callback
            })
        }

    });
    return layerPayTableModel;
});