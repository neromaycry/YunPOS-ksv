/**
 * Created by xuying on 2016/11/7.
 */


define(['../../js/common/BaseCollection',
    '../../moduals/print/model'],function(BaseCollection,printModel){

    var printCollection = BaseCollection.extend({

        model:printModel

    });

    return printCollection;
});