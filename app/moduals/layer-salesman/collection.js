/**
 * Created by Joey on 2016/7/22.
 */
define(['../../js/common/BaseCollection',
    '../../moduals/modal-salesman/model',],function(BaseCollection,SalesmanModel){
    var salesmanCollection=BaseCollection.extend({

        model:SalesmanModel,

        initCollection: function () {
            this.url = "./localdata/sales_assistant.json";
        },

    });

    return salesmanCollection;
});