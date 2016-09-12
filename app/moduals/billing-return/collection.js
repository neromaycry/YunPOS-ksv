/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/billing/model'],function(BaseCollection,BillModel){
    var billCollection=BaseCollection.extend({

        model:BillModel

    });

    return billCollection;
});