requirejs.config({
    baseUrl:'js',
    paths: {
        app:'app'
    }
});

requirejs(["app/FileSystem", "app/Store", "app/MemStore","jquery","jq-console/jqconsole","app/Console","app/Worker","app/utils"],
          function (FS, Store, MS, $, jqc, con, worker,u) {
    window.FS = FS;
    window.Store = Store;
    window.s = new MS.MemStore();
    window.jqc = jqc;
    window.con = con;
    var ce = document.getElementsByClassName("output")[0]
    window.cons = new window.con.Console(ce);
    window.cons.write("Hello & welcome\n");
    window.cons.prompt();
});
