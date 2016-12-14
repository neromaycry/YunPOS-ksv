/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseModel'], function (BaseModel) {

    var layerIICMemberModel = BaseModel.extend({

        defaults: {
            medium_id: '',
            name: '',
            score_balance: '',
            account_balance: ''
        },

        doMemberLogin: function (data, callback) {
            this.sendPOST({
                url: window.API_URL.VIPINFO,
                data: data,
                success: callback
            })
        }

    });
    return layerIICMemberModel;
});