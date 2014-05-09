define(["require","app/Channel"], function(require, chan) {
    return {
        /* Using require.js it loads the script worker_name
         * and runs it in a web worker thread opening a
         * channel to it.
         */
        run_worker: function (worker_name) {
            var worker_url = require.toUrl(worker_name);
            var worker = new Worker(worker_url);
            var channel = new chan.Channel(worker,chan.SyncUrl);
            worker.postMessage("");
            return channel;
        }
    }
});
