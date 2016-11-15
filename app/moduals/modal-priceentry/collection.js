/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-priceentry/model',],function(BaseCollection,PriceentryModel){
    var priceEntryCollection=BaseCollection.extend({

        model:PriceentryModel,

    });

    return priceEntryCollection;
});