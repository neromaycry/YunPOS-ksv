/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-qpwechat/model',],function(BaseCollection,QPWeChatModel){
    var qpwechatCollection = BaseCollection.extend({

        model:QPWeChatModel,

    });

    return qpwechatCollection;
});