// Memstore
define(["lib/utils", "lib/exceptions", "lib/os", "lib/store"], function(utils,EX, OS, Store) {
    'use strict';
    var consts = {
    };

    var Exc = EX.register("memstore");

    function MemStore() {
        Store.Store(this);
        var root = {
            dir:true,
            content:{}
        };
        var remove_leading_sep = function(path) { return utils.lstrip(path,OS.PATHSEP); }

        /* Expects normalized & resolved path */
        var find_parent = function(path) {
            var parent = OS.dirname(path);
            return find_node(root,parent)
        }
        var find_node = function(start_root, path) {
            var components = remove_leading_sep(path).split(OS.PATHSEP)
            if (components[0] == "" && components.length==1) return start_root;
            if (! (components[0] in start_root.content) ) throw new Exc(Store.FILE_NOT_FOUND);
            var next_root = start_root.content[components[0]];
            var rest = components.slice(1).join(OS.PATHSEP)
            if ( next_root.dir ) {
                if (components.length > 1) return find_node(next_root,rest);
                else return next_root;
            } else {
                if ( components.length > 1 ) throw new Exc(Store.FILE_NOT_FOUND);
                return next_root;
            }
        }


        /*
         * /test = /test/ = { parent:/, node: test }
         * / = {parent:/, node:/}
         * */
        var private_stat = function(path) {
            path = OS.resolve(path);
            var ret = {
                basename:OS.basename(path),
                type:Store.NONE,
                size:0,
                parent:null,
                node:null
            }, item;
            try {
                ret.parent = find_parent(path);
                if ( ret.basename === OS.PATHSEP ) ret.node = ret.parent;
                else ret.node = ret.parent.content[ret.basename];
                if ( ret.node ) {
                    ret.type = ret.node.dir ? Store.DIRECTORY : Store.FILE;
                    if (ret.node.dir) {
                        ret.size = 0;
                        for ( item in ret.node.content ) ret.size++;
                    } else ret.size = ret.node.content.length;
                }
            } catch (e) {}
            return ret;
        }

        /* *******************************************************
         *                   PUBLIC INTERFACE                    *
         * *******************************************************/
        this.cat = function(path) {
            var node = find_node(root, OS.resolve(path));
            if ( node.dir ) throw new Exc(Store.FILE_IS_DIR);
            return node.content;
        }
        this.ls = function(path) {
            var node = find_node(root, OS.resolve(path)), ret = [];
            if ( ! node.dir ) throw new Exc(Store.NOT_A_DIR);
            for ( item in node.content ) {
                ret.push( {name:item,type: node.content[item].dir ? Store.DIRECTORY : Store.FILE } );
            }
            return ret;
        }
        this.new = function(path,truncate) {
            var pstat = private_stat(path);
            if ( ! (pstat.type === Store.NONE ) && ! truncate ) throw new Exc(Store.FILE_EXISTS);
            if ( pstat.type === Store.DIRECTORY ) throw new Exc(Store.FILE_IS_DIR);
            if ( ! pstat.parent ) throw new Exc(Store.PARENT_DOES_NOT_EXIST);
            pstat.parent.content[pstat.basename] = {dir:false,content:""};
            return;
        }
        this.stat = function(path) {
            var ret = private_stat(path);
            return {
                type:ret.type,
                size:ret.size
            };
        }
        this.mv = function(path_f, path_t) {
            var fs = private_stat(path_f),
                ts = private_stat(path_t);

            if ( fs.type === Store.NONE ) throw new Exc(Store.FILE_NOT_FOUND);
            if ( ts.type === Store.DIRECTORY ) {
                if (! (fs.basename in ts.node.content) || ! ts.node.content[fs.basename].dir ) {
                    ts.node.content[fs.basename] = fs.node;
                } else throw new Exc(Store.FILE_IS_DIR);
            } else {
                ts.parent.content[ts.basename] = fs.node;
            }
            delete fs.parent.content[fs.basename];
        }
        this.write = function(path,data) {
            var node = find_node(root,OS.resolve(path));
            if ( node.dir ) throw new Exc(Store.FILE_IS_DIR);
            node.content = data;
            this.path_changed.emit(path,data);
        }
        this.mkdir = function(path) {
            var stat = private_stat(path);
            if ( ! (stat.type  === Store.NONE ) ) throw new Exc(Store.FILE_EXISTS);
            stat.parent.content[stat.basename] = { dir:true, content:{} };
        }
        this.rmdir = function(path) {
            var stat = private_stat(path);
            if ( stat.type === Store.NONE ) throw new Exc(Store.FILE_NOT_FOUND);
            if ( ! (stat.type === Store.DIRECTORY) ) throw new Exc(Store.NOT_A_DIR);
            if ( stat.size > 0 ) throw new Exce(Store.DIRECTORY_NOT_EMPTY);
            delete stat.parent.content[stat.basename];
        }
        this.rm = function (path) {
            var stat = private_stat(path);
            if ( stat.type === Store.NONE ) throw new Exc(Store.FILE_NOT_FOUND);
            if ( stat.type === Store.DIRECTORY ) throw new Exc(Store.FILE_IS_DIR);
            delete stat.parent.content[stat.basename];
        }

    }

    MemStore.prototype = new Store.Store();
    MemStore.prototype.constructor=MemStore;

    var ret = {
        MemStore:MemStore
    }

    utils.add_properties(ret,consts);
    return ret;
});
