/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-login/model',],function(BaseCollection,SecondloginModel){
    var secondloginCollection=BaseCollection.extend({

        model:SecondloginModel,

    });

    return secondloginCollection;
});