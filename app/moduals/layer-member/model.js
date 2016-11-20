/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseModel'],function(BaseModel){

    var layerMemberModel=BaseModel.extend({

        defaults:{
        },

        getMemberInfo: function (data,callback) {
            this.sendPOST({
                url:window.API_URL.VIPINFO,
                data:data,
                success:callback
            });
        }


    });
    return layerMemberModel;
});