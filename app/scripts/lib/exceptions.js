// Exceptions
define(function() {
  'use strict';

  return {
      register: function (module) {
            return function (code,msg) {
                if ( typeof code == "string" && msg === undefined) {
                    this.code = 0;
                    this.msg = code;
                } else {
                    this.code = code;
                    this.msg = msg || '';
                }
                this.module = module || 'global';
                this.toString = function() {
                    return "Exception in "+this.module+" ("+this.code+"): "+this.msg;
                }
            }
        }

  }

});
