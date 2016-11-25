define(['../../js/common/BaseCollection',
    '../../moduals/checking/model'], function (BaseCollection, checkingModel) {

    var checkingCollection = BaseCollection.extend({

        model: checkingModel

    });

    return checkingCollection;
});