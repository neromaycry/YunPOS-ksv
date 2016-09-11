/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/keytips-member/model'],function(BaseCollection,KeytipsModel){
    var keytipsCollection=BaseCollection.extend({

        model:KeytipsModel

    });

    return keytipsCollection;
});