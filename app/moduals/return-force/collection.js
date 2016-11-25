/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/return-force/model'], function (BaseCollection, ReturnforceModel) {
    var returnforceCollection = BaseCollection.extend({

        model: ReturnforceModel

    });

    return returnforceCollection;
});