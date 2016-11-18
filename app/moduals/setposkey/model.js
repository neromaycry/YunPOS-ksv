/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseModel'],function(BaseModel){

    var setposkeyModel=BaseModel.extend({

        init: function (data, callback1, callback2) {
            this.sendPOST({
                url: window.API_URL.INIT,
                data: data,
                success: callback1,
                error: callback2
            });
        }

    });
    return setposkeyModel;
});