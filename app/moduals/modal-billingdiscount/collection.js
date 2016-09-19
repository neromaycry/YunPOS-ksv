/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-billingdiscount/model',],function(BaseCollection,BilldiscountModel){
    var billdiscountCollection=BaseCollection.extend({

        model:BilldiscountModel,

    });

    return billdiscountCollection;
});