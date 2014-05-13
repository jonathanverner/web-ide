// Channel

/*jshint unused: vars */
define(['lib/channel'], function(lib) {
    'use strict';
    var sync_url = 'http://localhost:8000/synchronize';

    describe('Library: Channel', function () {
        var worker;

        beforeEach( function () {
            worker = lib.run_worker('/base/test/spec/simpleworker',sync_url);
        });

        afterEach( function () {
            worker.terminate();
        });

        it('synchronous send/receive should work ...', function () {
            var reply_to = worker.send("ping", lib.SYNC_REPLY);
            expect(worker.wait(reply_to)).toEqual("pong");
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
                expect(worker.wait(reply_to)).toEqual("pong");
                worker.terminate();
            });
        });

    });

});

