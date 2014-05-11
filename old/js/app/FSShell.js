importScripts('../require.js');

require({ baseUrl:'../',
          path: {
              app:'app',
              jquery:"//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min"
          }
        },
        ["app/WorkerChannel","app/utils"],
        function (channel,utils) {
            var exec = function(cmd) {
                if ( cmd == "input" ) {
                    ret = channel.remote_call("console.input",[]);
                    channel.remote_call("console.write",["\nUser input:"+ret+"\n"],null);
                    channel.remote_call("console.prompt",[],null);
                } else {
                    channel.remote_call("console.write",["Executing "+cmd+"\n"],null);
                    channel.remote_call("console.prompt",[],null);
                }
            }
            channel.provide("exec",exec,this);

});
