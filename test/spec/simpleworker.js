importScripts('/base/node_modules/requirejs/require.js');

require({
  baseUrl:'/base/app/scripts/',
  paths: {
      'lib':'lib'
  }
},
['/base/app/scripts/lib/channel.js', 'lib/logger'],
function (com,log) {
     var logger = log.register("simpleworker");
     var on_recv = function recv(data, id) {
            switch (data) {
                case 'ping':
                    logger.log("Received ping, sending response", log.DEBUG);
                    com.parent.reply('pong', id);
                    break;
                case 'sync':
                    var id = com.parent.send('sync',com.SYNC_REPLY);
                    var ret = com.parent.wait(id);
                    com.parent.send('sync_result:'+ret,com.NO_REPLY);
                    break;
            }
     };
     com.parent.received.connect(on_recv);
     com.parent.connect();
     return com;
});
