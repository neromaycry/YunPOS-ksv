/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-alipay/model',],function(BaseCollection,AlipayModel){
    var alipayCollection = BaseCollection.extend({

        model:AlipayModel,

    });

    return alipayCollection;
});