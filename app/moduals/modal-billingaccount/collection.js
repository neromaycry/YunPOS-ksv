/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-billingaccount/model',],function(BaseCollection,BillaccountModel){
    var billaccountCollection=BaseCollection.extend({

        model:BillaccountModel,

    });

    return billaccountCollection;
});