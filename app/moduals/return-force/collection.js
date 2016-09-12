/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/main/model'],function(BaseCollection,HomeModel){
    var homeCollection=BaseCollection.extend({

        model:HomeModel

    });

    return homeCollection;
});