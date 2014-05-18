// Utils
define(function() {
    'use strict';

    var consts = {};

    var add_properties = function (to_obj, from_obj) {
        var prop;
        for( prop in from_obj ) {
            to_obj[prop] = from_obj[prop];
        }
    };
    var lstrip = function (string, chars) {
            if (chars === undefined) chars = " \n\t";
            var i;
            for(i=0;i<string.length && chars.search(string[i]) > -1;i++);
            return string.slice(i);
    };
    var rstrip = function (string, chars) {
            if (chars === undefined) chars = " \n\t";
            var i;
            for(i=string.length-1; i >=0 && chars.search(string[i]) > -1; i--);
            return string.slice(0,i+1);
    };
    var strip = function (string, chars) {
        return rstrip(lstrip(string,chars),chars);
    };
    var startswith = function(string, prefix) {
        var i, slen=string.length, plen=prefix.length;
        for(i=0;i<slen && i < plen && string[i] === prefix[i]; i++);
        return (i === plen);
    };
    var endswith = function(string,postfix) {
        var i,slen=string.length, plen=postfix.length;
        for(i=0;i<slen && i < plen && string[slen-i] == postfix[plen-i]; i++);
        return (i == plen);
    }
    var enc64 = function(obj) {
        return btoa(encodeURIComponent(escape(JSON.stringify(obj))));
    }

    var sleep = function (msec) {
        var date = new Date();
        var curDate = null;
        do { curDate = new Date(); }
        while(curDate-date < msec);
    }

    var dec64 = function(string) {
        return JSON.parse(unescape(decodeURIComponent(atob(string))));
    }
    var randstr = function (length) {
        var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
        return result;
    }
    var server_log = function (msg) {
        console.log(msg);
        return true;
    }

    var isWorker = function () {
        var isBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document);
        var isWebWorker = !isBrowser && typeof importScripts !== 'undefined';
        return isWebWorker;
    }

    var ret = {
        lstrip:lstrip,
        rstrip:rstrip,
        strip:strip,
        startswith:startswith,
        endswith:endswith,
        enc64:enc64,
        dec64:dec64,
        randstr:randstr,
        server_log:server_log,
        add_properties:add_properties,
        isWorker:isWorker,
        sleep: sleep
    }

    add_properties(ret, consts);
    return ret;

});
