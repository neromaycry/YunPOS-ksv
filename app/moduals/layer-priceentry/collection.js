/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/layer-priceentry/model',], function (BaseCollection, LayerPriceEntryModel) {

    var layerPriceEntryCollection = BaseCollection.extend({

        model: LayerPriceEntryModel,

    });

    return layerPriceEntryCollection;
});