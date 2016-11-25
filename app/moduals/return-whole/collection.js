/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/return-whole/model'], function (BaseCollection, ReturnWholeModel) {
    var returnWholeCollection = BaseCollection.extend({

        model: ReturnWholeModel

    });
    return returnWholeCollection;
});