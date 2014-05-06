define(["app/Signals","app/os"], function(Signals,OS) {
    return {
        FSException: function(message) {
            this.message = message;
            this.name = "FSException";
            this.toString = function () { return this.name+":"+this.message;};
        },
        File: function(data) {
            var position=0;
            var cached_data = data;
            this.closed = false;
            this.close = function() {
                this.flush();
                this.closed = true;
                Signals.disconnect_all_handlers(this);
                Signals.disconnect_all_signals(this);
            };
            this.flush = function() {this.flushed.emit(cached_data);};
            this.read = function(sz) {
        if (this.closed){throw new FSException('I/O operation on closed file');}
        if (sz===undefined){return cached_data}
        else {
            position += sz;
            return cached_data.substr(position-sz,sz);
        };
    };
            this.readable = function(){return true};

            // Maybe move to PythonFile ?
            this.readline = function(limit){
        if(this.closed){throw new FSException('I/O operation on closed file');}
        var line = ''
        if(limit===undefined||limit===-1){limit=null}
        while(true){
            if(position>=cached_data.length-1){break;}
            else{
                var car = cached_data.charAt(position)
                if(car=='\n'){position++;return line}
                else{
                    line += car
                    if(limit!==null && line.length>=limit){return line}
                    position++
                }
            }
        }
    };
            this.readlines = function(hint){
        if(this.closed){throw new FSException('I/O operation on closed file');}
        var x = cached_data.substr(position).split('\n')
        if(hint && hint!==-1){
            var y=[],size=0
            while(true){
                var z = x.shift()
                y.push(z)
                size += z.length
                if(size>hint || x.length==0){return y}
            }
        }else{return x}
    };
            this.seek = function(offset,whence){
        if(this.closed){throw new FSException('I/O operation on closed file');}
        if(whence===undefined){whence=0}
        if(whence===0){position = offset}
        else if(whence===1){position += offset}
        else if(whence===2){position = cached_data.length+offset}
    };
            this.seekable = function(){return true};
            this.tell = function(){return position};
            this.writeable = function(){return true};
            this.write = function(str) {
                if (this.closed){throw new FSException('I/O operation on closed file');};
                cached_data = cached_data.substr(0,position)+str+cached_data.substr(position+str.length);
                position += str.length;
                this.content_changed.emit(cached_data);
            }
            this.on_change = function(new_content) {
                cached_data = new_content;
            }
            this.content_changed = new Signals.Signal("content");
            this.flushed         = new Signals.Signal("content");

        },
        FileSystem: function() {
            var mounts = [];
            var cwd = '/';
            var find_store = function (path) {
                if ( path[0] != OS.pathsep ) {
                    path = cwd+path;
                }
                var ret = { 'store':undefined, store_path:path }, match_len = 0;
                for(i=0; i < mounts.length; i++) {
                    if ( mounts[i].length > match_len && path.search(mounts[i].mount_point) == 0 ) {
                        ret.store = mounts[i].store;
                        match_len = mounts[i].mount_point.length;
                    }
                }
                ret.store_path=path.substr(match_len);
                return ret
            };

            // Public interface
            this.cwd = function(path) {cwd = path;};
            this.mkdir = function(path) {
                st = find_store(path);
                return st.store.mkdir(st.store_path);
            }
            this.ls  = function(path) {
                st = find_store(path);
                return st.store.ls(st.store_path);
            };
            this.open = function(path) {
                st = find_store(path);
                data = st.store.cat(st.store_path);
                pfile = new File(data);
                pfile.flushed.connect(function (content) {
                    st.store.write(st.store_path, content);
                });
                st.store.path_changed.connect(function (path,content) {
                    if (path == st.store_path) pfile.on_change(content);
                });
                return pfile;
            };
            this.unlink = function(path) {
                st = find_store(path);
                st.store.rm(st.store_path);
            };
            this.mount = function(mount_point, store) {
                mounts.push( {'mount_point':mount_point, 'store':store} );
            };
        }
    }
});
