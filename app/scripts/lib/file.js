// File
define(["lib/signals","lib/exceptions", "lib/utils"],function(Signals, Ex, utils) {
  'use strict';

    var consts = {
        READ:0,
        WRITE:1,
        READWRITE:2,
        APPEND:3,
        SEEK_START:4,
        SEEK_END:5,
        SEEK_CUR:6
    }

    var Exc = Ex.register("file");

    var File = function (data, mode) {
            var position=0;
            var cached_data = mode === consts.WRITE ? '' : data;
            this.closed = false;
            this.mode = mode;
            if (this.mode === consts.APPEND ) position=data.length;
            this.close = function() {
                this.flush();
                this.closed = true;
                Signals.disconnect_all_handlers(this);
                Signals.disconnect_all_signals(this);
            };
            this.flush = function() {this.flushed.emit(cached_data);};
            this.read = function(sz) {
                if (this.closed){throw new Exc('I/O operation on closed file');}
                if (! this.readable() ){throw new Exc('Read operation on a non-readable file.');}
                if (sz===undefined){return cached_data.substr(position);}
                else {
                    position += sz;
                    return cached_data.substr(position-sz,sz);
                };
            };
            this.readable = function(){return (!(this.mode === consts.WRITE))};

            // Maybe move to PythonFile ?
            this.readline = function(limit){
                if(this.closed){throw new Exc('I/O operation on closed file');}
                if (! this.readable() ){throw new Exc('Read operation on a non-readable file.');}
                var line = ''
                if(limit===undefined||limit===-1){limit=null}
                while(true){
                    if(position>=cached_data.length-1){break;}
                    else {
                        var car = cached_data.charAt(position)
                        if(car=='\n'){position++;return line}
                        else {
                            line += car
                            if(limit!==null && line.length>=limit){return line}
                            position++
                        }
                    }
                }
            };

            this.readlines = function(hint){
                if(this.closed){throw new Exc('I/O operation on closed file');}
                if (! this.readable() ){throw new Exc('Read operation on a non-readable file.');}
                var x = cached_data.substr(position).split('\n')
                if (hint && hint!==-1) {
                    var y=[],size=0
                    while(true) {
                        var z = x.shift()
                        y.push(z)
                        size += z.length
                        if(size>hint || x.length==0){return y}
                    }
                } else {return x}
            };
            this.seek = function(offset,whence) {
                if(this.closed){throw new Exc('I/O operation on closed file');}
                if(whence===undefined){whence=consts.SEEK_START}
                if(whence===consts.SEEK_START){position = offset}
                else if(whence===consts.SEEK_CUR){position += offset}
                else if(whence===consts.SEEK_END){position = cached_data.length+offset}
                if ( position >= cached_data.length ) position = cached_data.length;
                else if ( position < 0 ) position = 0;
            };
            this.seekable = function(){return true};
            this.tell = function(){return position};
            this.writeable = function(){return !(this.mode === consts.READ)};
            this.write = function(str) {
                if (this.closed) {throw new Exc('I/O operation on closed file');};
                if (!this.writeable()) { throw new Exc("Write on readonly file");};
                cached_data = cached_data.substr(0,position)+str+cached_data.substr(position+str.length);
                position += str.length;
                this.content_changed.emit(cached_data);
            }
            this.on_change = function(new_content) {
                cached_data = new_content;
            }
            this.content_changed = new Signals.Signal("content");
            this.flushed         = new Signals.Signal("content");

    };


    var ret = {
        File:File
    }

    utils.add_properties(ret, consts);

  return ret;

});
