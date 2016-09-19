/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/initinfo/model'],function(BaseCollection,InitInfoModel){
    var InitInfoCollection=BaseCollection.extend({

        model:InitInfoModel

    });

    return InitInfoCollection;
});