/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/rtbilling/model'], function (BaseCollection, RTBillModel) {
    var rtbillCollection = BaseCollection.extend({

        model: RTBillModel

    });

    return rtbillCollection;
});