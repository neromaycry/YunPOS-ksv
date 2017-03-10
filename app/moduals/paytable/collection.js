/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/paytable/model',], function (BaseCollection, payTableModel) {

    var payTableCollection = BaseCollection.extend({

        model: payTableModel

    });

    return payTableCollection;
});