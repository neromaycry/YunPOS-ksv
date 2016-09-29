/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-restorder/model',],function(BaseCollection,RestOrderModel){
    var restOrderCollection=BaseCollection.extend({

        model:RestOrderModel

    });

    return restOrderCollection;
});