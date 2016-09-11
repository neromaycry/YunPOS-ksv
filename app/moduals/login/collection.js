/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/login/model'],function(BaseCollection,LoginModel){
    var loginCollection=BaseCollection.extend({

        model:LoginModel

    });

    return loginCollection;
});