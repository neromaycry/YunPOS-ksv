/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-brecardlogin/model',],function(BaseCollection,BRECardModel){
    var brecardCollection=BaseCollection.extend({

        model:BRECardModel,

    });

    return brecardCollection;
});