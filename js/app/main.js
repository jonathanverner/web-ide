requirejs.config({
    baseUrl:'js',
    paths: {
        app:'app'
    }
});

requirejs(["app/FileSystem", "app/Store", "app/MemStore"], function (FS, Store, MS) {
    window.FS = FS;
    window.Store = Store;
    window.s = new MS.MemStore();
});
