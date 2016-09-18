/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseModel'],function(BaseModel){

    var billModel=BaseModel.extend({

        defaults:{
            discount:0
        },

        trade_confirm: function (data, callback) {
            this.sendPOST({
                url:window.API_URL.TRADE_CONFIRM,
                data:data,
                success:callback
            });
        }

    });
    return billModel;
});