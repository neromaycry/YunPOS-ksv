/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/restorder/model'],function(BaseCollection,RestorderModel){
    var restorderCollection=BaseCollection.extend({

        model:RestorderModel

    });

    return restorderCollection;
});