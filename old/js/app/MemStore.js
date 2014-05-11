define(["app/Store","app/os","app/utils"],function (Store,OS,utils) {

    function MemStore() {
        Store.Store(this);
        var root = {
            dir:true,
            content:{}
        };
        var remove_leading_sep = function(path) { return utils.lstrip(path,OS.pathsep); }

        var basename = function(path) {
            return path.split(OS.pathsep).splice(-1)[0];
        }

        var find_parent = function(path) {
            var components = path.split(OS.pathsep);
            var parent = '/'+components.slice(0,-1).join(OS.pathsep);
            return find_node(root,parent)
        }
        var find_node = function(start_root, path) {
            var components = remove_leading_sep(path).split(OS.pathsep)
            if (components[0] == "" && components.length==1) return start_root;
            if (! (components[0] in start_root.content) ) throw new Store.StoreException(Store.Exceptions.FILE_NOT_FOUND);
            var next_root = start_root.content[components[0]];
            var rest = components.slice(1).join(OS.pathsep)
            if ( next_root.dir ) {
                if (components.length > 1) return find_node(next_root,rest);
                else return next_root;
            } else {
                if ( components.length > 1 ) throw new Store.StoreException(Store.Exceptions.FILE_NOT_FOUND);
                return next_root;
            }
        }

        this._find_node = find_node;
        this._find_parent = find_parent;
        this._basename = basename;
        this._root = root;
        this._remove_leading_sep = remove_leading_sep;
        this._OS = OS;
        this._utils = utils;

        this.cat = function(path) {
            var node = find_node(root, path);
            if ( node.dir ) throw new Store.StoreException(Store.Exceptions.FILE_IS_DIR);
            return node.content;
        }

        this.ls = function(path) {
            var node = find_node(root, path), ret = [];
            if ( ! node.dir ) throw new Store.StoreException(Store.Exceptions.NOT_A_DIR);
            for ( item in node.content ) {
                ret.push( {name:item,type: node.content[item].dir ? Store.TP.DIRECTORY : Store.TP.FILE } );
            }
            return ret;
        }

        this.new = function(path,truncate) {
            var node = find_parent(path);
            var name = basename(path);
            if ( name in node.content ) {
                if (! truncate ) throw new Store.StoreException(Store.Exceptions.FILE_EXISTS);
                if ( node.content[name].dir ) throw new Store.StoreException(Store.Exceptions.FILE_IS_DIR);
            }
            node.content[name]= { dir:false, content:"" };
        }

        this.stat = function(path) {
            var ret = {};
            try {
                var node = find_node(root,path);
                if (node.dir) {
                    ret.type=Store.TP.DIRECTORY;
                    ret.size=0;
                    for ( item in node.content ) ret.size++;
                } else {
                    ret.type=Store.TP.FILE;
                    ret.size=node.content.length;
                }
            } catch (e) {
                if (e.code == Store.Exceptions.FILE_NOT_FOUND) {
                    ret.type = Store.TP.NONE
                } else throw e;
            }
            return ret;
        }

        this.mv = function(path_f, path_t) {
            var parent_f = find_parent(path_f), parent_t = find_parent(path_t);
            var name_f = basename(path_f), name_t = basename(path_t);
            if ( ! (name_f in parent_f.content) ) throw new Store.StoreException(Store.Exceptions.FILE_NOT_FOUND);
            parent_t.content[name_t]=parent_f.content[name_f];
            delete parent_f.content[name_f];
        }
        this.write = function(path,data) {
            var node = find_node(root,path);
            if ( node.dir ) throw new Store.StoreException(Store.Exceptions.FILE_IS_DIR);
            node.content = data;
            this.path_changed.emit(path,data);
        }
        this.mkdir = function(path) {
            var parent = find_parent(path), name = basename(path);
            if ( name in parent.content ) throw new Store.StoreException(Store.Exceptions.FILE_EXISTS);
            parent.content[name] = { dir:true, content:{} };
        }
    }
    MemStore.prototype = new Store.Store();
    MemStore.prototype.constructor=MemStore;

    return {
        MemStore:MemStore
    }
});
