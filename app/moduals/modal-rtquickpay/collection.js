/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-rtquickpay/model',],function(BaseCollection,RTQuickpayModel){
    var rtquickpayCollection=BaseCollection.extend({

        model:RTQuickpayModel,

    });

    return rtquickpayCollection;
});