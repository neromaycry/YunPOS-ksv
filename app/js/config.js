/**
 * Created by gjwlg on 2016/9/9.
 */
require.config({
    waitSeconds:0,
    baseUrl:'./js/lib/',
    paths:{
        'jquery':'jquery-2.2.3',
        'storage':'../jquery-storageapi/jquery.storageapi.min',
        'underscore':'underscore',
        'backbone':'backbone.min',
        "validation": "backbone-validation",
        'common':'common',
        'toastr':'../toastr/toastr.min',
        'remodal':'../remodal/remodal',
        'bootstrap':'../bootstrap/js/bootstrap',
        'text': 'requirePlugin/text',
        'css': 'requirePlugin/css',
        'json': 'requirePlugin/json',
        '_fetchText': 'requirePlugin/_fetchText',
    },
    shim:{
        'backbone':{
            'deps':['underscore'],
            'exports':'Backbone'
        },
        "validation": {
            "deps": ["backbone"],
            "exports": "validation"
        },
        'underscore':{
            'exports':'_'
        },
        'bootstrap':{
            'deps':['jquery'],
            'exports':'Bootstrap'
        },
        'storage':{
            'deps':['jquery']
        },
        'md5':{
            'deps':['jquery']
        },
        'toastr':{
            'deps':['css!../toastr/toastr.css'],
            'exports':'toastr'
        },
        'remodal':{
            'deps':['css!../remodal/remodal.css','css!../remodal/remodal-default-theme.css'],
            'exports':'remodal'
        }
    }
});

require([
    'jquery',
    'underscore',
    'backbone',
    'common',
    'js/common/Router.js',
    'validation',
    'bootstrap',
    'storage',
    'toastr',
    'remodal'
], function ($,_,Backbone,common,Router,validation,Bootstrap,storage,toastr,remodal) {
    window.storage = $.localStorage;

    Backbone.history.start();
    _.extend(Backbone.Model.prototype, Backbone.Validation.mixin)


});