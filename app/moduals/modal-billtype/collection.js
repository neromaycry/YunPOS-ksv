/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-billtype/model',],function(BaseCollection,BilltypeModel){
    var billtypeCollection=BaseCollection.extend({

        model:BilltypeModel,

    });

    return billtypeCollection;
});