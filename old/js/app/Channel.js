define(["jquery","app/utils"], function (jquery,utils) {
    var Types = {
        RPC:0,  /* Remote Procedure Call */
        RPR:1,  /* Remote Procedure Result */
        CONNECT:2,
        ERROR:3 /* Error */
    }
    var CallTypes = {
        SYNC:0,
        ASYNC:1,
        DISCARD:2
    }
    var base_chan_id = utils.randstr(30);
    var num_chans = 0;
    return {
        SyncUrl:'/synchronize',
        CallTypes:CallTypes,
        Channel: function (worker, sync_url, chanid) {

            /**********************************************
             *              PRIVATE VARIABLES             *
             **********************************************/

            var local_sync_methods = {},
                local_async_methods = {},
                result_handlers = {},
                last_message_id = 0,
                connected = false,
                out_msg_queue = [],
                in_msg_queue = [],
                self = this;

            /**********************************************
             *              PRIVATE METHODS               *
             **********************************************/

            /* Attempt connection to slave.
             *
             * Note: Only does anything in the master
             */
            var connect = function() {
                if (worker) {
                    var connect_msg = {type:Types.CONNECT,data:{sync_url:sync_url,channel_id:self.channel_id},sync:CallTypes.DISCARD};
                    addMSGID(connect_msg);
                    doPostMSG(connect_msg);
                }
            }

            /* Adds a unique message id to the message.
             *
             * Implementation Note: This id is composed of a channel id
             * (a random string+a number) concatenated with the message
             * sequence number.
             */
            var addMSGID = function(msg) {
                if ( (! ('id' in msg) ) && connected ) {
                    msg.id = self.channel_id+':'+String(last_message_id++);
                }
                return msg.id;
            }

            /* Send the message @msg. If @through_server is true,
             *
             * send it through the server.
             *
             * Note: If we are not connected yet, the message will
             * be queued for later.
             *
             * Implementation Note: The actual sending is done in doPostMSG;
             */
            var postMSG = function(msg, through_server) {
                var ret =  addMSGID(msg);
                out_msg_queue.push({m:msg,s:through_server});
                if (connected) processOUTQueue();
                else connect();
                return ret
            }

            /* If connected, send all the messages in the outgoing queue.
             *
             * Implementation Note: The actual sending is done in doPostMSG;
             */
            var processOUTQueue = function () {
                var i;
                if ( connected ) {
                    while ( item = out_msg_queue.pop() ) doPostMSG(item.m,item.s);
                }

            }

            /* Actually send the message @msg, either through a server (via AJAX)
             * if @through_server is true or by calling postMessage.
             *
             * Note: The message JSON.stringified and base64 encoded for transport.*/
            var doPostMSG = function(msg,through_server) {
                var message = utils.enc64(msg);
                if (through_server) {
                    jquery.ajax({
                        url:sync_url+'/'+self.channel_id+'/',
                        data:{
                            message:message,
                        },
                        dataType:"text",
                        type:'POST'
                    }).fail(function (req, status, error) {
                        console.log("ERROR SENDING MESSAGE "+msg.id+"; STATUS:"+status+"; ERROR:"+error);
                        console.log("ORIGINAL MESSAGE: " + JSON.stringify(msg));
                        throw error;
                    });
                } else {
                    if (worker === null) postMessage(msg);
                    else worker.postMessage(msg);
                }
            }

            /* Sends @result as a response to message @msg.
             *
             * If @msg.sync is
             *
             *   -- CallTypes.DISCARD then it discards @result and does nothing
             *   -- CallTypes.ASYNC then it sends it via postMessage (i.e. in browser)
             *   -- CallTypes.SYNC then it sends it through a through_server
             */
            var postResult = function(msg, result) {
                var message = {
                    type:Types.RPR,
                    reply_to:msg.id,
                    data:result
                }
                if ( msg.sync === CallTypes.DISCARD ) return;
                postMSG( message, msg.sync === CallTypes.SYNC);
            }

            /* Sends an indication that the message @msg, which was
             * received, resulted in an error */
            var postError = function(msg, error) {
                var message = {
                    type:Types.ERROR,
                    reply_to:msg.id,
                    data:error
                }
                post( message, msg.sync === CallTypes.SYNC );
            };

            /* Event handler for incoming messages
             *
             * Note: currently only for postMessage messages, not
             * for messages coming through a server*/
            var recvMSG = function(event) {
                var i;
                in_msg_queue.push(event.data);
                for(i=0;i<in_msg_queue.length;i++) {
                    processMSG(in_msg_queue[i]);
                }
                in_msg_queue = [];
            };

            /* Takes a message object @msg and processes it.
             * If it is of type
             *
             *    --- RPC then it calls the method and posts the results
             *        via postResult
             *
             *    --- RPR then it calls the result handler if it exists passing @msg.data
             *        as its argument; if it does not exist it returns the @msg.data
             */
            var processMSG = function(msg) {
                var i, not_processed = [], method_name, method_args, method, result;
                switch( msg.type ) {
                    /* Message is a request for calling a local method */
                    case Types.RPC:
                        method_name = msg.data.name;
                        method_args = msg.data.args;
                        if (method_name in local_sync_methods) {
                            method = local_sync_methods[method_name];
                            result = method.f.apply(method.o, method_args);
                            postResult(msg, result);
                        } else if (method_name in local_async_methods) {
                            method = local_async_methods[method_name];
                            method.f.apply(method.o, method_args.concat([function (result){
                                postResult(msg,result);
                            }]));
                        } else {
                            postError(msg,"Unknown method"+method_name);
                            console.log("Unknown method:"+method_name);
                        }
                        return true;
                    /* Message is a response to a rpc call */
                    case Types.RPR:
                        if (msg.reply_to in result_handlers) {
                            result_handlers[msg.reply_to](msg.data);
                        } else return msg.data;
                    /* Message is a part of the initial connection handshake */
                    case Types.CONNECT:
                        connected = true;
                        if (worker) {
                            processOUTQueue();
                            console.log("Slave connected");
                        }
                        else {
                            self.channel_id = msg.data.channel_id;
                            sync_url = msg.data.sync_url;
                            console.log("Connected to master, sync_url:"+sync_url+"; id:"+self.channel_id);
                            postMSG({type:Types.CONNECT, data:null, reply_to:msg.id,sync:CallTypes.DISCARD},false);
                        }
                        return true;
                    /* Message is either of unknown type or is malformed */
                    default:
                        console.log("Unknown message type");
                }
            }

            /* Waits for the result of the rpc call requested
             * in a msg with id @msgid;
             *
             * If @calltp is
             *
             *   -- CallTypes.DISCARD then it returns immediately an undefined value
             *   -- CallTypes.ASYNC then it asynchronously waits for the response and
             *      then calls the callback function with the response
             *   -- CallTypes.SYNC it polls the sync_server for messages waiting for
             *      the response to arrive; if it receives a message which is not a reply
             *      (its reply_to field is different from @msgid) it queues it for later
             *      processing; when the response arrives it returns it
             */
            var waitResult = function(msgid, calltp, callback) {
                var i,msgs=[],msg,got_reply,reply;
                if (calltp === CallTypes.DISCARD) return;
                if (calltp === CallTypes.ASYNC) result_handlers[msgid] = callback;
                else {
                    while (true) {
                      req = new XMLHttpRequest();
                      req.open('GET', sync_url+'/'+self.channel_id+'/',false);
                      req.send(null);
                      if ( req.status === 200 ) {
                          msgs = JSON.parse(req.responseText);
                          got_reply = false;
                          for(i=0;i<msgs.length;i++) {
                              msg = utils.dec64(msgs[i])
                              if (msg.reply_to === msgid) {
                                  got_reply = true;
                                  reply = msg.data;
                              } else in_msg_queue.push(msg);
                          }
                          if (got_reply) return reply;
                      }
                    }
                };
            }


            /**********************************************
             *              INITIALIZATION                *
             **********************************************/
            this.worker = worker;
            this.channel_id = (chanid === undefined) ? base_chan_id+num_chans++ : chanid;

            if (worker === null) {
                onmessage = recvMSG;
            } else {
                worker.onmessage = recvMSG;
                connect();
            }

            /**********************************************
             *          SEMI PRIVATE METHODS              *
             **********************************************/
            this._recvMSG = recvMSG;

            this.provide = function(name, func, object) {
                local_sync_methods[name] = {f:func, o:object};
            }

            /* Assumes that the function @func calls the
             * last argument (a callback) with the result
             * once the result is available */
            this.provide_async = function (name, func, object) {
                local_async_methods[name] = {f:func,o:object};
            }

            this.close = function () {
                if ( this.worker ) {
                    this.worker.terminate();
                }
            }

            /* Initiates a RPC executing @name on the
             * remote end. If @callback is
             *  -- a function, it is called with the result when available.
             *  -- null, then the result is discarded
             *  -- undefined then we wait until the result is available and then return it
             */
            this.remote_call = function(name,args,callback) {
                var tp;
                if ( callback === null ) tp = CallTypes.DISCARD;
                else if ( callback === undefined ) tp = CallTypes.SYNC;
                else tp = CallTypes.ASYNC;
                var id = postMSG({
                    type:Types.RPC,
                    data:{name:name,args:args},
                    sync:tp
                });
                return waitResult(id,tp,callback)
            }
        }
    }
});
