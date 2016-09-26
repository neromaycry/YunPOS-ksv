/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-brecardpay/model',],function(BaseCollection,BRECardPayModel){

    var brecardpayCollection=BaseCollection.extend({

        model:BRECardPayModel,

    });

    return brecardpayCollection;
});