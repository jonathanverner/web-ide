define([
    'intern!object',
    'intern/chai!assert',
    'app/MemStore',
    'app/FileSystem'
], function (registerSuite, assert, MS, FS) {
    var createEmptyFS = function () {
        var st = new MS.MemStore();
        var fs = new FS.FileSystem();
        fs.mount('/',st);
        return fs;
    }

    registerSuite({
        name: "FileSystem",

        basic: function () {
            var fs = createEmptyFS();
            var fl = null;
            assert.strictEqual(fs.ls("/").length, 0, "Root should be empty on FS with empty store");
            try {
                fl = open('/test');
                assert.fail(undefined,new FS.FSException,"ReadOnly open of a file on an empty filesystem should throw exception");
            } catch (e) {
            }
        },

        filemodes: function () {
            var data = "AHOJ",
                fs = createEmptyFS(),
                fl = fs.open('/test',FS.FileModes.WRITE),
                real = '';

            fl.write(data);
            fl.close();
            fl = fs.open('/test',FS.FileModes.READ);
            real = fl.read();
            assert.strictEqual(real,data,"File should have content written to it (expecting:"+data+"; got:"+real+";");
            fl.close();

            fl = fs.open('/test',FS.FileModes.APPEND);
            fl.write(data);
            fl.close();
            fl = fs.open('/test',FS.FileModes.READ);
            real = fl.read();
            assert.strictEqual(real,data+data,"Append should append content to file (expecting:"+data+data+"; got:"+real+";");
            fl.close();

            fl = fs.open('/test',FS.FileModes.WRITE);
            fl.close();
            fl = fs.open('/test',FS.FileModes.READ);
            real = fl.read();
            assert.strictEqual(real,"","Append should append content to file (expecting:; got:"+real+";");
            fl.close();
        }

    });
});
