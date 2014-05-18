// Logger

/*jshint unused: vars */
define(['lib/logger'], function(lib) {
    'use strict';

    describe('Library: Logger', function () {

        var loggerA = lib.register("A"),
            console_spy;

        beforeEach( function () {
            console_spy = spyOn(console, 'log');
        });

        it('should save messages to history', function () {
            loggerA.log("TEST",lib.DEBUG);
            expect(loggerA.history[0]).toEqual({level:lib.DEBUG,message:"TEST"});
        });

        it('by default, should only print messages of error level >= WARN', function () {
            loggerA.log("TEST",lib.NOTICE);
            expect(console_spy).not.toHaveBeenCalled();
            loggerA.log("TEST",lib.WARN);
            expect(console_spy).toHaveBeenCalled();
        });

        it('disabled loggers should not print messages', function () {
            lib.disable("A");
            loggerA.log("TEST",lib.NOTICE);
            expect(console_spy).not.toHaveBeenCalled();
        });

        it('enabled loggers should print messages of appropriate level', function () {
            lib.enable("A", lib.CRITICAL);
            loggerA.log("TEST",lib.ERROR);
            expect(console_spy).not.toHaveBeenCalled();
            loggerA.log("TEST",lib.CRITICAL);
            expect(console_spy).toHaveBeenCalled();
        });

        it('disable/enable methods of logger should work ', function () {
            loggerA.enable(lib.CRITICAL);
            expect(loggerA.enabled(lib.CRITICAL)).toBe(true);
            expect(loggerA.enabled(lib.ERROR)).toBe(false);
            loggerA.disable();
            expect(loggerA.enabled(lib.CRITICAL)).toBe(false);
        });

    });

});

