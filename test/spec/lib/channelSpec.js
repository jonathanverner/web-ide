// Channel

/*jshint unused: vars */
define(['lib/logger','lib/channel'], function(log,lib) {
    'use strict';
    var sync_url = 'http://localhost:8000/synchronize';

    describe('Library: Channel', function () {
        var worker;

        beforeEach( function () {
            var connected = false;
            runs( function () {
                worker = lib.run_worker('/base/test/spec/simpleworker',sync_url);
                worker.connected.connect(function() {
                    connected = true;
                });
            });
            waitsFor(function() {
                return connected;
            }, "the worker should connect", 1000);

        });

        afterEach( function () {
            worker.terminate();
        });

        it('parent should not be present in main thread', function () {
            expect(lib.parent).toBe(undefined);
        });

        /* SYNCHRONOUS SEND FROM MAIN THREAD DOES NOT WORK,
         * WEB WORKER DOES NOT SEEM TO GET A CHANCE TO SEND
         * REPLY */
        /*
        it('synchronous send/receive from parent should work ...', function () {
            var reply_to = worker.send("ping", lib.SYNC_REPLY);
            expect(worker.wait(reply_to)).toEqual("pong");
        });*/

        it('synchronous send/receive from child should work ...', function () {
            var recvd = false, result = '';
            runs(function () {
                worker.received.connect( function reply( data, id, reply_to ) {
                    if ( data === 'sync' ) worker.reply('result',id);
                    else if ( data.indexOf('sync_result') === 0 ) {
                        recvd = true;
                        result = data;
                    }
                });
                worker.send("sync", lib.SYNC_REPLY);
            });
            waitsFor(function() {
                return recvd;
            }, "the worker should reply", 2000);
            runs(function () {
                expect(result).toEqual("sync_result:result");
            });
        });


        it('async send/receive should work ...', function () {
            var reply_to, recvd = false, reply;
            runs(function() {
                worker.received.connect(function(data, id, r_to) {
                    if ( reply_to == r_to ) {
                        reply = data;
                        recvd = true;
                    }
                });
                reply_to = worker.send("ping", lib.ASYNC_REPLY);
            });

            waitsFor(function() {
                return recvd;
            }, "the worker should reply", 1000);

            runs(function() {
                expect(reply).toEqual("pong");
                worker.terminate();
            });
        });

    });

});

