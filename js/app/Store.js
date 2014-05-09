define(["app/Signals","app/os"], function(Signals,OS) {
    var EX_MESSAGES = {
        1:"File Not Found",
        2:"File is a directory",
        3:"Not a directory",
        4:"File exists"
    };
    var ExToString = function(ex) {
        if (ex in EX_MESSAGES) {
            return EX_MESSAGES[ex];
        } else {
            return "Unknown/Other Exception"+ex;
        }
    };
    return {
        Exceptions: {
            FILE_NOT_FOUND:1,
            FILE_IS_DIR:2,
            NOT_A_DIR:3,
            FILE_EXISTS:4
        },
        TP: {
            FILE:0,
            DIRECTORY:1,
            NONE:2
        },
        StoreException: function(code) {
            this.message = ExToString(code);
            this.name = "StoreException";
            this.code = code;
            this.toString = function () { return this.name+"("+this.code+"):"+this.message;};
        },
        Store: function() {
            this.cat  = function(path,version) {};
            this.mv   = function(patha,pathb) {};
            this.ls   = function(path) {};
            this.rm   = function(path) {};
            this.new  = function(path) {};
            this.write= function(path,data) {};
            this.mkdir= function(path) {};
            this.stat = function(path) {};

            this.path_changed = new Signals.Signal("path","content");

            // Version control
            this.stage_change = function(path, diff_to_stage) {};
            this.stage_file   = function(path) {};
            this.stage_all    = function(path) {};
            this.commit       = function() {};
            // Checks out branch @branch_name (and creates it, if necessary)
            this.branch       = function(branch_name) {};
            this.delete_branch= function(branch_name) {};
        }
    };
});
