define(function () {
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
    return {
        lstrip:lstrip,
        rstrip:rstrip,
        strip:strip,
        startswith:startswith
    }
});
