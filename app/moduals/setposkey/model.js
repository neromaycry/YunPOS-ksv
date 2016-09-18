/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseModel'],function(BaseModel){

    var setposkeyModel=BaseModel.extend({

        init: function (data, callback) {
            this.sendPOST({
                url: window.API_URL.INIT,
                data: data,
                success: callback,
                error:function(){
                    toastr.error('网络请求失败或网关错误');
                }
            });
        }

    });
    return setposkeyModel;
});