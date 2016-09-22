/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseModel'],function(BaseModel){

    var homeModel=BaseModel.extend({

        defaults:{
            pos:'',
        },

        goods: function (data, callback) {
            this.sendPOST({
                url: window.API_URL.BARGAINGOODS,
                data: data,
                success: callback
            });
        },
        sku: function (data, callback) {
            this.sendPOST({
                url: window.API_URL.SKU,
                data: data,
                success: callback
            });
        },
        logout: function (data, callback) {
            this.sendPOST({
                url:window.API_URL.LOGIN,
                data:data,
                success:callback
            })
        }
    });
    return homeModel;
});