// Store
define(["lib/os", "lib/utils", "lib/exceptions", "lib/signals"], function(os, utils, Ex, sig) {
  'use strict';

  var consts = {
      FILE_NOT_FOUND:3,
      FILE_IS_DIR:4,
      NOT_A_DIR:5,
      FILE_EXISTS:6,
      DIRECTORY_NOT_EMPTY:7,
      PARENT_DOES_NOT_EXIST:8,

      FILE:0,
      DIRECTORY:1,
      NONE:2
  };

  var Exc = Ex.register("store");
  var Store = function() {
            this.cat  = function(path,version) {};
            this.mv   = function(patha,pathb) {};
            this.ls   = function(path) {};
            this.rm   = function(path) {};
            this.new  = function(path,truncate) {};
            this.write= function(path,data) {};
            this.mkdir= function(path) {};
            this.rmdir= function(path) {};
            this.stat = function(path) {};

            this.path_changed = new sig.Signal("path","content");

            // Version control
            this.stage_change = function(path, diff_to_stage) {};
            this.stage_file   = function(path) {};
            this.stage_all    = function(path) {};
            this.commit       = function() {};

            // Checks out branch @branch_name (and creates it, if necessary)
            this.branch       = function(branch_name) {};
            this.delete_branch= function(branch_name) {};
  }

  utils.add_properties(Store.prototype,consts);

  var ret = {
      Store:Store
  };

  utils.add_properties(ret,consts);

  return ret;

});
