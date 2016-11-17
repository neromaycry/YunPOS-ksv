/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseModel'],function(BaseModel){

    var billtypeModel=BaseModel.extend({

        defaults:{

        },

        xfbbillno:function(data,callback){
        this.sendPOST({
            url:window.API_URL.XFB_BILL_NO,
            data:data,
            success:callback
        });
    }

    });
    return billtypeModel;
});