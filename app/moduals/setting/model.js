define(['../../js/common/BaseModel'], function (BaseModel) {

    var checkingModel = BaseModel.extend({

        defaults: {
            pos: '',
            date: '',
            money: '',
            sale_num: '',
            sale_money: '',
            refund_num: '',
            refund_money: '',
            sub_num: '',
            sub_money: ''
        },

        report: function (data, callback) {
            this.sendPOST({
                url: window.API_URL.REPORT,
                data: data,
                success: callback
            });
        }
    });
    return checkingModel;
});