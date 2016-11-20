/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/keytips-member/model'],function(BaseCollection, layerHelpModel){
    var layerHelpCollection = BaseCollection.extend({

        model:layerHelpModel

    });

    return layerHelpCollection;
});