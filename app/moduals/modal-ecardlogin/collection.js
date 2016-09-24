/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-ecardlogin/model',],function(BaseCollection,ECardModel){
    var ecardCollection=BaseCollection.extend({

        model:ECardModel,

    });

    return ecardCollection;
});