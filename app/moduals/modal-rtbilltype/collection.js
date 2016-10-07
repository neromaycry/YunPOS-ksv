/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-rtbilltype/model',],function(BaseCollection,RTBilltypeModel){
    var rtbilltypeCollection=BaseCollection.extend({

        model:RTBilltypeModel,

    });

    return rtbilltypeCollection;
});