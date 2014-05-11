// Exceptions

/*jshint unused: vars */
define(['lib/exceptions'], function(lib) {
    'use strict';

    describe('Library: Exceptions', function () {
        var ExT = lib.register("test_module");

        it('Register should return an exception type belonging to the module.', function () {
            var e1 = new ExT(10,"Ahoj");
            expect(e1.module).toEqual("test_module");
        });

    });

});

