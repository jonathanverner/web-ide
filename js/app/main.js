requirejs.config({
    baseUrl:'js',
    paths: {
        app:'app',
        jquery: "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min"
    }
});

requirejs(["app/FileSystem", "app/Store", "app/MemStore","jquery","jq-console/jqconsole","app/Console","app/Worker","app/utils"],
          function (FS, Store, MS, $, jqc, con, worker,u) {
    window.FS = FS;
    window.Store = Store;
    window.s = new MS.MemStore();
    window.jqc = jqc;
    window.$ = $;
    window.con = con;
    var ce = document.getElementsByClassName("output")[0]
    window.cons = new window.con.Console(ce);
    window.cons.write("Hello & welcome\n");
    window.cons.prompt();
    window.worker = worker;
    window.utils = u;
    chan = worker.run_worker("app/FSShell.js");
    chan.provide("console.write",window.cons.write,window.cons);
    chan.provide("console.prompt",window.cons.prompt,window.cons);
    chan.provide_async("console.input",window.cons.readline,window.cons);
    window.cons.command_input.connect(function (cmd) { chan.remote_call("exec",[cmd],null);});
    window.chan = chan;
});
