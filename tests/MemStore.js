define([
    'intern!object',
    'intern/chai!assert',
    'app/Store',
    'app/MemStore'
], function (registerSuite, assert, Store,MS) {
    registerSuite({
        name: "MemStore",

        basic: function () {
            st = new MS.MemStore();
            assert.strictEqual(st.ls("/").length, 0, "Root should be empty on MemStore creation");
        },

        stat: function () {
            var st = new MS.MemStore(), data="AHOJ";
            st.mkdir("/tt");
            st.new("/test");
            var stat_root = st.stat('/'),
                stat_tt = st.stat('/tt'),
                stat_test = st.stat('/test');
            assert.strictEqual(stat_root.type, Store.TP.DIRECTORY,"/ should be a directory");
            assert.strictEqual(stat_root.size, 2, "/ should have two entries");
            assert.strictEqual(stat_tt.type, Store.TP.DIRECTORY,"mkdir('/tt') should make '/tt' an (empty) directory");
            assert.strictEqual(stat_tt.size, 0, "Empty directory (/tt) should have 0 entries");
            assert.strictEqual(stat_test.type, Store.TP.FILE,"new('/test') should make '/test' a file");
            assert.strictEqual(stat_test.size, 0, "new('/test') should make /test an empty file");
            st.write('/test',data);
            stat_test = st.stat('/test');
            assert.strictEqual(stat_test.size, data.length, "write('/test',data) should make /test a file of size data.length");
        }

    });
});
