/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/layer-rtbilltype/model',], function (BaseCollection, RTLayerTypeModel) {

    var rtLayerTypeCollection = BaseCollection.extend({

        model: RTLayerTypeModel,

    });

    return rtLayerTypeCollection;
});