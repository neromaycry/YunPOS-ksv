/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/hconnection/model'],function(BaseCollection,HModel){
    var HCollection=BaseCollection.extend({

        model:HModel

    });

    return HCollection;
});