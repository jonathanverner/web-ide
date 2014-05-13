importScripts('/base/node_modules/requirejs/require.js');

require({
  baseUrl:'/base/app/scripts/',
  paths: {
      'lib':'lib',
  }
},
['/base/app/scripts/lib/channel.js'],
function (com) {
     var on_recv = function (data, id) {
            switch (data) {
                case 'ping':
                    com.parent.reply_to('pong', id);
                    break;
                case 'sync':
                    var id = com.parent.send('sync',com.SYNC_REPLY);
                    var ret = com.parent.wait(id);
                    com.parent.send('sync_result:'+ret,com.NO_REPLY);
                    break;
            }
     };
     com.parent.received.connect(on_recv);
     return com;
});
