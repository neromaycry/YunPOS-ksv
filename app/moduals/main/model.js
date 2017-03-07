/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseModel'], function (BaseModel) {

    var homeModel = BaseModel.extend({

        defaults: {
            pos: '',
            retail_no: ''
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
                url: window.API_URL.LOGIN,
                data: data,
                success: callback
            })
        },
        relateWorker: function (data, callback) {
            this.sendPOST({
                url: window.API_URL.WORKER,
                data: data,
                success: callback
            });
        },
        getRetailNo: function (data, callback) {
            this.sendPOST({
                url: window.API_URL.RETAIL_NO,
                data: data,
                success: callback
            });
        },
        password: function (data, callback) {
            this.sendPOST({
                url: window.API_URL.PASSWDCHANGE,
                data: data,
                success: callback
            });
        }

    });
    return homeModel;
});