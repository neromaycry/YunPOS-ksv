/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-binstruction/model',],function(BaseCollection,BinstructionModel){
    var binstructionCollection=BaseCollection.extend({

        model:BinstructionModel,

    });

    return binstructionCollection;
});