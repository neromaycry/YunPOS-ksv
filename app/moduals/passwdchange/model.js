/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseModel'], function (BaseModel) {

    var passwdChangeModel = BaseModel.extend({

        password: function (data, callback) {
            this.sendPOST({
                url: window.API_URL.PASSWDCHANGE,
                data: data,
                success: callback
            });
        }

    });
    return passwdChangeModel;
});