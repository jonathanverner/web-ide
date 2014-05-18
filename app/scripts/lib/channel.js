// Channel
define(["require","lib/utils", "lib/logger", "lib/exceptions", "lib/signals"], function(require, utils, log, EX, sig) {
    'use strict';

    var consts = {
        SYNC_URL:'/synchronize',
        NO_REPLY:0,
        ASYNC_REPLY:1,
        SYNC_REPLY:2,
        _SYSTEM_CONNECT:3,
        _SEND_BROWSER:4,
        _SEND_SERVER:5,
        _UNKNOWN_MSG_TYPE:6
    };

    var Exc = EX.register("channel"),
        logger = log.register("channel");

    var Channel = function (worker, sync_url, channel_id) {

        /**********************************************
         *              PRIVATE VARIABLES             *
         **********************************************/
        var cid = channel_id,
            last_message_id=0,
            is_connected = false,
            in_msg_queue = [],
            out_msg_queue = [],
            sync_replies = [],
            self = this;

        var Message = function (type, payload, reply_to, send_type) {
            var self = this;
            this.processed = false;
            if ( send_type === undefined ) send_type = consts._SEND_BROWSER;
            if ( reply_to === undefined ) reply_to = -1;
            if ( typeof type == "number" ) {
                this.type = type;
                this.payload = payload;
                this.reply_to = reply_to;
                this.id = last_message_id++;
            } else {
                try {
                    var dec = utils.dec64(type);
                    this.type = dec.type;
                    this.payload = dec.payload;
                    this.reply_to = dec.reply_to;
                    this.id = dec.id;
                } catch (e) {
                    this.type = consts._UNKNOWN_MSG_TYPE;
                    this.payload = type;
                    this.id = null;
                    this.reply_to = null;
                }
            }
            this.send = function () {
                var msg_data = utils.enc64(this);
                logger.log("Message.send:"+JSON.stringify(this), log.DEBUG);
                if ( send_type == consts._SEND_BROWSER ) {
                    if (worker) worker.postMessage(msg_data)
                    else postMessage(msg_data);
                } else if ( send_type == consts._SEND_SERVER ) {
                    utils.ajax({
                        context:this,
                        url:sync_url+'/'+cid+'/',
                        data:{
                            message:msg_data
                        },
                        type:'POST'
                    }, function (req, status, error) {
                        logger.log("ERROR SENDING MESSAGE "+self.id+"; STATUS:"+status+"; ERROR:"+error,log.ERROR);
                        logger.log("ORIGINAL MESSAGE: " + JSON.stringify(this), log.ERROR);
                        throw new Exc("Synchronize server: error sending message "+error);
                    });
                } else throw new Exc("Unknown send type"+send_type);
            }
        }

        /**********************************************
         *              PRIVATE METHODS               *
         **********************************************/

        var send_connect_msg = function() {
            var msg = new Message(consts._SYSTEM_CONNECT,{ sync_url:sync_url, cid:cid }, consts._SEND_BROWSER);
            msg.send();
        }

        var processQueues = function() {
            var i, m;
            /* INPUT QUEUE */
            for(i=0;i < in_msg_queue.length; i++) {
                m = in_msg_queue[i];
                if (m.processed) continue;
                m.processed = true;
                switch(m.type) {
                    case consts._SYSTEM_CONNECT:
                        if ( worker ) {
                            logger.log("Child trying to connect", log.DEBUG);
                            if (m.payload.sync_url === sync_url && m.payload.cid === cid ) {
                                logger.log("Child successfully connected", log.DEBUG);
                                is_connected = true;
                                self.connected.emit();
                            } else send_connect_msg();
                        } else {
                            cid = m.payload.cid;
                            sync_url = m.payload.sync_url;
                            var r = new Message(consts._SYSTEM_CONNECT,{cid:cid,sync_url:sync_url},m.id);
                            is_connected = true;
                            r.send();
                            self.connected.emit();
                        }
                        break;
                    case consts.SYNC_REPLY:
                        sync_replies.push(m.id);
                        self.received.emit(m.payload, m.id, m.reply_to);
                    case consts._UNKNOWN_MSG_TYPE:
                        break;
                    default:
                        self.received.emit(m.payload, m.id, m.reply_to);
                }
            }
            in_msg_queue = []

            /* OUTPUT QUEUE */
            if ( ! is_connected ) self.connect();
            else {
                for(i=0;i<out_msg_queue.length; i++) {
                    if (out_msg_queue[i].processed) continue;
                    out_msg_queue[i].processed = true;
                    out_msg_queue[i].send();
                }
                out_msg_queue = []
            }
        }

        var messageHandler = function (event) {
            var msg = new Message(event.data);
            logger.log("Received msg:"+JSON.stringify(msg.payload), log.DEBUG);
            in_msg_queue.push(msg);
            processQueues();
        }

        /**********************************************
         *              PUBLIC METHODS               *
         **********************************************/

        /* Send a message with payload @msg. @reply_type
         * is either
         *
         *  -- ASYNC_REPLY ... we expect an asynchronous reply
         *  -- SYNC_REPLY  ... we expect a synchronous reply
         *  -- NO_REPLY    ... no reply is expected
         *
         * Returns the id of the message sent (useful for
         * waiting for replies);*/
        this.send = function(msg, reply_type) {
            var msg = new Message(reply_type, msg);
            out_msg_queue.push(msg);
            processQueues();
            return msg.id;
        };

        /* Reply to a message with id @reply_to;
         * payload is in @msg */
        this.reply = function(msg, reply_to) {
            var send_type;
            var pos = sync_replies.indexOf(reply_to);
            if ( pos >= 0 ) {
                send_type = consts._SEND_SERVER;
                sync_replies.splice(pos,1);
            } else send_type = consts._SEND_BROWSER;
            logger.log("Replying to "+reply_to+" via "+ ((send_type === consts._SEND_BROWSER) ? 'browser' :'server')+" with "+ msg, log.DEBUG);
            var m = new Message( consts.NO_REPLY, msg, reply_to, send_type );
            out_msg_queue.push(m);
            processQueues();
        };

        /* Synchronously waits until a reply to
         * the message with id @reply_to arrives
         *
         * WARNING: Currently does not work from the
         * main thread !!!
         */
        this.wait = function(reply_to, on_reply) {
            if ( typeof on_reply === "function" ) {
                var waiter = function WAITER( data, reply_id, msg_reply_to ) {
                    if ( reply_to === msg_reply_to ) on_reply(data, reply_id, msg_reply_to);
                    this.received.disconnect(waiter);
                };
                this.received.connect(waiter, this);
            } else {
                var in_msgs, msg, got_reply, reply, req,i;
                var timeout = worker ? 1000 : -1,
                    start   = new Date(),
                    now     = 0;
                if ( typeof on_reply === "number" ) timeout = timeout;
                if (! is_connected ) throw new Exc("Cannot wait, not yet connected");
                while (true) {
                    req = new XMLHttpRequest();
                    req.open('GET', sync_url+'/'+cid+'/',false);
                    req.send(null);
                    if ( req.status === 200 ) {
                        in_msgs = JSON.parse(req.responseText);
                        got_reply = false;
                        for(i=0;i<in_msgs.length;i++) {
                            msg = new Message(in_msgs[i]);
                            logger.log("Got sync message"+JSON.stringify(msg), log.DEBUG);
                            if ( msg.reply_to === reply_to ) {
                                got_reply = true;
                                reply = msg.payload;
                            } else in_msg_queue.push(msg);
                        }
                        if (got_reply) return reply;
                    } else {
                        logger.log("Server Error ("+req.status+"):"+req.responseText,log.ERROR);
                    }
                    if ( timeout >= 0 ) {
                        now = new Date();
                        if ( now-start > timeout ) throw new Exc("wait: Timeout waiting for reply to "+reply_to);
                    }
                    utils.sleep(250);
                }
            };
        };

        /* Terminates the remote worker.
         *
         * Note: The channel is unusable afterwards */
        this.terminate = function () {
            if ( worker ) worker.terminate;
        };


        /* Attempt connection to parent.
         *
         * Note: To be called when child is ready to accept messages.
         */
        this.connect = function() {
            if ( (! is_connected) && (! worker)) send_connect_msg();
        }


        /**********************************************
         *              PUBLIC SIGNALS                *
         **********************************************/
        /* Fired when a message arrives with payload in @data,
         * id of the message in @id and the id of the message
         * to which it is a reply (if any) in @reply_to */
        this.received = new sig.Signal("data","id", "reply_to");

        /* Fired when a connection with the other side is
         * established */
        this.connected = new sig.Signal();


        /**********************************************
         *              INITIALIZATION                *
         **********************************************/
        if ( worker ) {
            if ( ! cid ) cid = utils.randstr(32);
            logger.prefix = '(parent) ';
            logger.log("Registering parent message handler", log.DEBUG);
            worker.onmessage = messageHandler;
        } else {
            logger.prefix = '(child) ';
            logger.log("Registering child message handler", log.DEBUG);
            onmessage = messageHandler;
        }
    };




    var is_a_webworker = utils.isWorker();

    var src_to_data_uri = function (src) {
        var URL = window.URL || window.webkitURL;
        var blob;
        try {
            blob = new Blob([src], {type: 'application/javascript'});
        } catch (e) { // Backwards-compatibility
            window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
            blob = new BlobBuilder();
            blob.append(src);
            blob = blob.getBlob();
        }
        return URL.createObjectURL(blob)
    };

    var run_worker_url = function (url, sync_url) {
        if (sync_url === undefined) sync_url = consts.SYNC_URL;
        var worker = new Worker(url);
        var channel = new Channel(worker,sync_url);
        worker.postMessage("");
        return channel;
    };

    var ret = {
       run_worker: function (worker_name, sync_url) {
            return run_worker_url(require.toUrl(worker_name)+'.js', sync_url);
        },
       run_worker_code:function (worker_code, sync_url) {
            return run_worker_url(src_to_data_uri(worker_code), sync_url);
       }
    }

    if (is_a_webworker) ret.parent = new Channel(null);

    utils.add_properties(ret,consts);

    return ret;
});
