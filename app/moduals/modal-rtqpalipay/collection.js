/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-rtqpalipay/model',],function(BaseCollection,RTQpAliPayModel){
    var rtqpalipayCollection = BaseCollection.extend({

        model:RTQpAliPayModel,

    });

    return rtqpalipayCollection;
});