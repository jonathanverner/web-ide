define([
    'intern!object',
    'intern/chai!assert',
    'app/MemStore'
], function (registerSuite, assert, MS) {
    registerSuite({
        name: "MemStore",

        basic: function () {
            st = new MS.MemStore();
            assert.strictEqual(st.ls("/").length, 0, "Root should be empty on MemStore creation");
        }
    });
});
