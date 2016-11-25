/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseModel'], function (BaseModel) {

    var memberModel = BaseModel.extend({

        defaults: {
            medium_id: '请查询',
            name: '请查询',
            address: '请查询',
            account_balance: '请查询',
            account_enddate: '请查询',
            score_balance: '请查询',
        },

        getMemberInfo: function (data, callback) {
            this.sendPOST({
                url: window.API_URL.VIPINFO,
                data: data,
                success: callback
            });
        }

    });
    return memberModel;
});