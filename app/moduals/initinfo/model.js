define(['../../js/common/BaseModel'],function(BaseModel){

    var initmodel = BaseModel.extend({

        defaults:{
            posid:'',
            merchantno:'',
            shopid:'',
            merchantname:''
        },
        init:function(data,callback){
            this.sendPOST({
                url:window.API_URL.INIT,
                data:data,
                success:callback
            });
        }
    });

    return initmodel;
});