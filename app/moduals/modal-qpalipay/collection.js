/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-qpalipay/model',],function(BaseCollection,QpAliPayModel){
    var qpalipayCollection = BaseCollection.extend({

        model:QpAliPayModel,

    });

    return qpalipayCollection;
});