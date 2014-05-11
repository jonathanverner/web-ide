define(["jquery"], function (jquery) {
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
            return string.slice(i);
    };
    var strip = function (string, chars) {
        return rstrip(lstrip(string,chars),chars);
    };
    var startswith = function(string, prefix) {
        var i;
        for(i=0;i<string.lenght && i < prefix.length && string[i] == prefix[i]; i++);
        return (i == prefix.length);
    };
    var endswith = function(string,postfix) {
        var i,slen=string.length, plen=postfix.length;
        for(i=0;i<slen && i < plen && string[slen-i] == prefix[plen-i]; i++);
        return (i == prefix.length);
    }
    var enc64 = function(obj) {
        return btoa(encodeURIComponent(escape(JSON.stringify(obj))));
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
        jquery.ajax({
                url:'/log/',
                data:{
                    message:msg,
                },
                dataType:"text",
                    type:'POST'
        }).done(function() {});
    }

    return {
        lstrip:lstrip,
        rstrip:rstrip,
        strip:strip,
        startswith:startswith,
        endswith:endswith,
        enc64:enc64,
        dec64:dec64,
        randstr:randstr,
        server_log:server_log
    }
});
