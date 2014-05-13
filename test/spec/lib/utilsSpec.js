// Utils

/*jshint unused: vars */
define(['lib/utils'], function(lib) {
    'use strict';

    describe('Library: Utils', function () {

        it('add_properties should add properties to an object', function () {
            var prop = {A:0,B:1,C:2};
            var test = new function () { this.test = 1; };
            lib.add_properties(test,prop);
            expect(test.A).toEqual(prop.A);
            expect(test.B).toEqual(prop.B);
            expect(test.C).toEqual(prop.C);
        });
        it('lstrip should strip characters from left', function () {
            expect(lib.lstrip("  \t\nAhoj")).toEqual("Ahoj");
            expect(lib.lstrip(";-;-AHOJ-;",";-")).toEqual("AHOJ-;");
        });
        it('rstrip should strip characters from right', function () {
            expect(lib.rstrip("Ahoj  \t\n ")).toEqual("Ahoj");
            expect(lib.rstrip(";-AHOJ-;-;",";-")).toEqual(";-AHOJ");
        });
        it('strip should strip characters from both sides', function () {
            expect(lib.strip("\t\n\t  Ahoj  \t\n ")).toEqual("Ahoj");
            expect(lib.strip(";-AHOJ-;-;",";-")).toEqual("AHOJ");
        });
        it('startswith should test whether string starts with another', function () {
            expect(lib.startswith('Ahoj','Aho')).toBe(true);
            expect(lib.startswith('Ahoj','aho')).toBe(false);
        });
        it('endsswith should test whether string ends with another', function () {
            expect(lib.endswith('Ahoj','hoj')).toBe(true);
            expect(lib.endswith('Ahoj','Aho')).toBe(false);
        });
        it('enc64 and dec64 should be inverses of each other', function () {
            var obj = {'ahoj':10, 'cau':20, 'test':50,'arr':[1,2,3,4], 'obj':{a:0,b:1,c:2}};
            expect(lib.dec64(lib.enc64(obj)) ).toEqual(obj);
            expect(lib.enc64(lib.dec64(lib.enc64(obj))) ).toEqual(lib.enc64(obj));
        });

    });


});
