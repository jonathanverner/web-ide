// Os

/*jshint unused: vars */
define(['lib/os'], function(lib) {
    'use strict';

    describe('Library: OS', function () {

        var cp = function (path) {
            var i;
            ret = '';
            for(i=0;i<path.length;i++) {
                if (path[i] == '/') ret += lib.PATHSEP;
                else ret += path[i];
            }
            return ret;
        }


        it('Should define PATHSEP ...', function () {
            expect(lib.PATHSEP).toBeDefined();
        });
        it('normalize should discard superfluous slashes', function () {
            expect(lib.normalize(cp('/'))).toEqual(cp('/'));
            expect(lib.normalize(cp('//'))).toEqual(cp('/'));
            expect(lib.normalize(cp('//a//a/b///c////d////'))).toEqual(cp('/a/a/b/c/d'));
            expect(function () { return lib.normalize(cp('a//b')); }).toThrow();
            expect(lib.normalize(cp('//a//a/b///c////d'))).toEqual(cp('/a/a/b/c/d'));
            expect(lib.normalize(cp('/test'))).toEqual(cp('/test'));
        });
        it('basename should return filename (without path)', function () {
            var patha = '/test', pathb='', filea='test', fileb='';
            expect(lib.basename(cp('/test/test'))).toEqual(cp('test'));
            expect(lib.basename(cp('/test/'))).toEqual('test');
            expect(lib.basename(cp('/test'))).toEqual('test');
            expect(lib.basename(cp('/'))).toEqual(cp('/'));
        });
        it('dirname should return the name of the parent directory', function () {
            expect(function () { return lib.dirname(''); }).toThrow();
            expect(function () { return lib.dirname('abc'); }).toThrow();
            expect(lib.dirname(cp('/test'))).toEqual(cp('/'));
            expect(lib.dirname(cp('/a/b/c'))).toEqual(cp('/a/b'));
            expect(lib.dirname(cp('/a/b/c///'))).toEqual(cp('/a/b'));
            expect(lib.dirname(cp('/'))).toEqual(cp('/'));
        });
        it("resolve should resolve '..' and '.' and return the normalized path", function () {
            expect(lib.resolve(cp('/ahoj/../../../ahoj/ahoj/../test/.//.///'))).toEqual('/ahoj/test');
        });
    });
});


