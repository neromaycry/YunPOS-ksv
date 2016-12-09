/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseModel'],function(BaseModel){

    var ecardpayModel=BaseModel.extend({

        defaults:{

        },

        account:function (data, callback) {
            this.sendPOST({
                url:window.API_URL.ACCOUNT,
                data:data,
                success:callback
            });
        }

    });
    return ecardpayModel;
});