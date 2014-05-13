// Memstore

/*jshint unused: vars */
define(['lib/memstore'], function(lib) {
    'use strict';

    var st = null;
    beforeEach( function () {
        st = new lib.MemStore();
    });

    afterEach( function () {
        st = null;
    });

    describe('Library: Memstore', function () {

        it('Root should be empty on MemStore creation.', function () {
            expect(st.ls("/")).toEqual([]);
        });
        it('stat / should give correct info on empty directory.', function () {
            var stat_root = st.stat('/');
            expect(stat_root.type).toEqual(st.DIRECTORY);
            expect(stat_root.size).toEqual(0);
        });
        it('stat on a file should give correct file size and type', function () {
            var data = "ahoj";
            st.new('/test');
            st.new('/test_empty');
            st.write('/test',data);
            var stat = st.stat('/test');
            var stat_empty = st.stat('/test_empty');
            expect(stat.type).toEqual(st.FILE);
            expect(stat.size).toEqual(data.length);
            expect(stat_empty.size).toEqual(0);
        });
        it('stat on a directory should give correct size & type', function () {
            var files = ["a","b"],i;
            st.mkdir("/test");
            for(var i=0; i< files.length; i++) st.new("/test/"+files[i]);
            var stat = st.stat("/test");
            expect(stat.type).toEqual(st.DIRECTORY);
            expect(stat.size).toEqual(files.length);
        });
        it('new should not truncate a directory', function () {
           st.mkdir("/tt");
           expect( function () { st.new("/tt",true); } ).toThrow();
        });
        it('new should not create on old file without explicit truncate', function () {
            st.new("/tt");
            expect( function () { st.new("/tt"); } ).toThrow();
        });
        it('new should make file empty when truncating', function () {
            var data = "ahoj";
            st.new("/tt");
            st.write("/tt",data);
            st.new("/tt",true);
            var stat = st.stat("/tt");
            expect( stat.size ).toEqual(0);
        });
        it('cat should return file contents', function () {
            var data = "ahoj";
            st.new("/test");
            st.write("/test",data);
            expect(st.cat("/test")).toEqual(data);
        });
        it('rm should delete a file', function () {
            st.new("/test");
            st.write("/test","TST");
            st.rm("/test");
            var stat = st.stat("/test");
            expect(stat.type).toEqual(st.NONE);
        });
        it("rm should not delete a directory", function () {
            st.mkdir("/test");
            expect( function () { st.rm("/test"); } ).toThrow();
        });
        it("rmdir should not delete a nonempty directory", function () {
            st.mkdir("/test");
            st.new("/test/t");
            expect( function () { st.rmdir("/test/t"); }).toThrow();
        });
        it("rmdir should delete an empty directory", function () {
            st.mkdir("/test");
            st.rmdir("/test");
            var stat = st.stat("/test");
            expect(stat.type).toEqual(st.NONE);
        });
        it("mv should move into if target is a directory", function () {
            st.mkdir("/target");
            st.mkdir("/source");
            st.new("/source/a");
            st.mv("/source","/target");
            var sttgt = st.stat("/target/source/a"), stsrc = st.stat("/source");
            expect(sttgt.type).toEqual(st.FILE);
            expect(stsrc.type).toEqual(st.NONE);
        });
        it("mv should overwrite target, if it is a file", function () {
            st.new("/target");
            st.mkdir("/source");
            st.new("/source/a");
            st.mv("/source","/target");
            var sttgt = st.stat("/target/a"), stsrc = st.stat("/source");
            expect(sttgt.type).toEqual(st.FILE);
            expect(stsrc.type).toEqual(st.NONE);
        });
        it("mv should create target, if it does not exist", function () {
            st.mkdir("/source");
            st.new("/source/a");
            st.mv("/source","/target");
            var sttgt = st.stat("/target/a"), stsrc = st.stat("/source");
            expect(sttgt.type).toEqual(st.FILE);
            expect(stsrc.type).toEqual(st.NONE);
        });
        it("mv should fail to move a non existant source or into a nonexistant target", function () {
            st.mkdir("/source");
            st.new("/source/a");
            expect( function () { st.mv("/source","/target/test"); } ).toThrow();
            expect( function () { st.mv("/nonexsistant","/source"); } ).toThrow();
            var stsrc = st.stat("/source/a");
            expect(stsrc.type).toEqual(st.FILE);
        });
    });

});


