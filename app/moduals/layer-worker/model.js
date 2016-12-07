/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseModel'], function (BaseModel) {

    var layerWorkerModel = BaseModel.extend({

        defaults: {

        },

        relateWorker: function (data, callback) {
            this.sendPOST({
                url: window.API_URL.WORKER,
                data: data,
                success: callback
            });
        }

    });
    return layerWorkerModel;
});