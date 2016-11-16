/**
 * Created by gjwlg on 2016/9/9.
 */
define(['../../js/common/BaseModel'],function(BaseModel){

    var loginModel=BaseModel.extend({

        initModel: function (options) {
            // 属性验证
            this.bind("invalid", function (view, attrs, error, selector) {
                for (var _key in attrs) {
                    alert(attrs[_key]);
                    //this.modal_options = {
                    //    title: "提示",
                    //    content: attrs[_key],
                    //    isShowOK: false,
                    //    onModalOKClicked: function (event, content) {
                    //        $(".for-modal-tips").modal("hide");
                    //    },
                    //    onModalCloseClicked: function (event, content) {
                    //    },
                    //    extraModalContent: function (content) {
                    //    }
                    //};
                    //var _modal = new ModalView(this.modal_options);
                    //_modal.render();
                    //$(".for-modal-tips").modal("show");
                    return;
                }
            });
        },

        getFirstClass: function (callback) {
            this.sendPOST({
                url:window.API_URL.KIND1,
                data:{},
                async:false,
                success:callback
            })
        },

        login: function (data, callback1, callback2) {
            this.sendPOST({
                url: window.API_URL.LOGIN,
                data: data,
                success: callback1,
                error: callback2
            });
        },

        requestGatherDetail: function (data,callback1, callback2) {
            this.sendPOST({
                url: window.API_URL.GATHER,
                data: data,
                success: callback1,
                error: callback2
            });
        }

    });
    return loginModel;
});