// Logger
define(["lib/utils"], function(utils) {
    'use strict';
    var consts = {
        DEBUG:0,
        NOTICE:1,
        WARN:2,
        ERROR:3,
        CRITICAL:4
    };

    var enabled = [],
        registered = [],
        _console = false,
        _worker = utils.isWorker();

    if (typeof console !== 'undefined') {
        _console = console;
    }


    var _find_name = function ( name ) {
        var i;
        for(i=0;i<enabled.length; i++) {
            if ( enabled[i].name === name ) return i;
        }
        return -1;
    }

    var _to_console = function ( name, level ) {
        var pos = _find_name(name);
        if ( pos > -1 && enabled[pos].level <= level ) return true;
        return false;
    }

    var _output = function ( msg ) {
        if ( _console ) _console.log(msg);
        else if (_worker) postMessage(msg);
    }

    var disable = function (name) {
            var i = _find_name(name);
            if ( i > -1 ) enabled.splice(i,1);
    };

    var enable = function (name, errorlevel) {
          var i = _find_name( name );
          if ( i > -1 ) enabled[i].level = errorlevel;
          else enabled.push( {name:name, level:errorlevel} );
    };

    var logger = function ( name ) {
        this.history = [];
        this.prefix = '';
        registered.push(name);
        this.log = function (message, level) {
            if ( level === undefined ) level = consts.WARN;
            message = this.prefix+message;
            this.history.push({level:level, message:message});
            if (_to_console(name, level)) _output(name + ":"+message);
        }
        this.enable = function (level) {
            enable(name, level);
        }
        this.enabled = function (level) {
            return _to_console( name, level );
        }

        this.disable = function () {
            disable(name);
        }
    };

    var ret = {
        register: function (name) {
            registered.push(name);
            enable(name, consts.WARN);
            return new logger(name);
        },
        enable: enable,
        disable: disable,
        enabled: _to_console
    }

    utils.add_properties(ret,consts);
    return ret;
});
