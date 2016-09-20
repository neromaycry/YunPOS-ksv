define(['../../js/common/BaseModel'],function(BaseModel){

    var secondloginModel=BaseModel.extend({

        defaults:{

        },

        secondlogin: function (data,callback) {
            this.sendPOST({
                url: window.API_URL.LOGIN,
                data: data,
                success: callback
            });
        },

    });
    return secondloginModel;
});