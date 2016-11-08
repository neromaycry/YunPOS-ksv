/**
 * Created by xuying on 2016/11/7.
 */

define(['../../js/common/BaseModel'],function(BaseModel){

    var printModel = BaseModel.extend({

        defaults:{

        },

        print: function (data, callback) {
            this.sendPOST({
                url: window.API_URL.PRINT,
                data: data,
                success: callback
            });
        }
    });
    return printModel;
});