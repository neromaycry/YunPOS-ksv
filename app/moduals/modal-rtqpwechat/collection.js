/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-rtqpwechat/model',],function(BaseCollection,RTQPWeChatModel){
    var rtqpwechatCollection = BaseCollection.extend({

        model:RTQPWeChatModel,

    });

    return rtqpwechatCollection;
});