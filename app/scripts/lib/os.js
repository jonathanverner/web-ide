// Os
define(["lib/utils","lib/exceptions"], function(utils, EX) {
    'use strict';
    var consts = {
        PATHSEP:'/'
    };

    var Exc = EX.register("os");

    /*
     * /test = /test/ = /test// = /test
     * /a//b///c///             = /a/b/c
     * /                        = /
     * test/ = test = test//    = test: ERROR
     * ''                       = '': ERROR
     */
    var normalize = function (path) {
        var i=0, ret = '', sep = false;
        var rpath = utils.rstrip(path, consts.PATHSEP);
        if ( ! utils.startswith(path, consts.PATHSEP) ) throw Exc("Normalize needs absolute path");
        /* Special case '/' */
        if ( rpath.length === 0 && path.length > 0 ) return '/';
        for(i=0;i<rpath.length;i++) {
            if ( rpath[i] != consts.PATHSEP ) sep = false;
            if ( ! sep ) ret += rpath[i];
            if ( rpath[i] == consts.PATHSEP ) sep = true;
        }
        return ret;
    };

    var resolve = function (path) {
        var norm = normalize(path);
        var components = norm.split(consts.PATHSEP);
        var i, ret = []
        for(i=0;i<components.length;i++) {
            if ( components[i] === '.' ) continue;
            if ( components[i] === '..' ) ret.pop();
            else ret.push(components[i]);
        }
        return normalize(consts.PATHSEP+ret.join(consts.PATHSEP));
    }

    /* Returns the last component of the path @path */
    var basename = function(path) {
        var ret = normalize(consts.PATHSEP+path).split(consts.PATHSEP).splice(-1)[0];
        /* Special case '/', '//', ... */
        if ( path.length > 0 && ret.length == 0 ) return consts.PATHSEP;
        else return ret;
    }

    /* Returns the normalized path to the parent of @path.
     *
     * @path must be absolute (i.e. start with /)
     */
    var dirname = function(path) {
        var np = normalize(path),i;
        if ( np === consts.PATHSEP ) return consts.PATHSEP;
        for(i=np.length-1;i>=0 && np[i] != consts.PATHSEP; i--);
        if ( i === 0 && np[0] === consts.PATHSEP ) return consts.PATHSEP;
        if ( i < 0 ) return '';
        return np.slice(0,i);
    }

    var ret = {
        basename:basename,
        dirname:dirname,
        normalize:normalize,
        resolve:resolve
    }

    utils.add_properties(ret,consts);
    return ret;
});
