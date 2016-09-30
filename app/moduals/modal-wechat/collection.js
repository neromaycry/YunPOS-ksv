/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-wechat/model',],function(BaseCollection,WeChatModel){
    var wechatCollection = BaseCollection.extend({

        model:WeChatModel,

    });

    return wechatCollection;
});