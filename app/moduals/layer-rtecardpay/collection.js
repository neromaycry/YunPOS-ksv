/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/layer-ecardpay/model',],function(BaseCollection,ECardPayModel){

    var ecardpayCollection=BaseCollection.extend({

        model:ECardPayModel,

    });

    return ecardpayCollection;
});