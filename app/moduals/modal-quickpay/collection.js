/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-quickpay/model',],function(BaseCollection,QuickpayModel){
    var quickpayCollection=BaseCollection.extend({

        model:QuickpayModel,

    });

    return quickpayCollection;
});