define(['../../js/common/BaseModel'], function (BaseModel) {

    var checkingModel = BaseModel.extend({

        defaults: {
            pos: '',
            date: '',
            money: 0,
            sale_num: '',
            sale_money: 0,
            refund_num: '',
            refund_money: 0,
            sub_num: '',
            sub_money: 0
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