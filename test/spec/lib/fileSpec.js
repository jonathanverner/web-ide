// File

/*jshint unused: vars */
define(['lib/file'], function(lib) {
  'use strict';

  describe('Library: file', function () {
    var data = "RANDOM DATA", data2 = "RANDOM DATA 2",
        fro = new lib.File(data, lib.READ),
        fwo = new lib.File(data, lib.WRITE),
        frw = new lib.File(data, lib.READ_WRITE),
        fa  = new lib.File(data, lib.APPEND),
        seek_pos = 2,
        content = {};

    fwo.content_changed.connect( function(nd) {
        content['fwo'] = nd;
    });


    it('Read with no parameter should return the contents of the file.', function () {
        expect(fro.read()).toEqual(data);
    });
    it('Read past end should return empty string.', function () {
        expect(fro.read()).toEqual(data);
    });
    it('Seek(0) should rewind to the beginning',function () {
        fro.seek(0);
        expect(fro.read(1)).toEqual(data[0]);
        fro.seek(0);
    });
    it('Write to a file opened in read-only mode should fail', function() {
        expect(function () { fro.write("test"); }).toThrow();
    });
    it('Calling the on_change slot should rewind position and reload data', function() {
        fro.on_change(data2);
        expect(fro.read()).toEqual(data2);
    });

    it('File open for writing should be truncated', function () {
        fwo.seek(0,lib.SEEK_END);
        expect(fwo.tell()).toEqual(0);
    });
    it('Writing to a file should emit a file changed signal with content', function () {
        fwo.write(data);
        expect(content['fwo']).toEqual(data);
    });
    it('Reading from a writeonly file should fail', function () {
        expect(fwo.read).toThrow();
    });

    it("File opened for appending should have position at the end, read should return ''", function () {
        expect(fa.read()).toEqual("");
    });
    it('Writing to a file opened for appending should append data', function() {
        fa.write(data2);
        fa.seek(0);
        expect(fa.read()).toEqual(data+data2);
    });

    it("Seeking from the end should work", function () {
        fa.seek(-data2.length,lib.SEEK_END);
        expect(fa.read()).toEqual(data2);
    });
    it("Seeking should default to seek from beginning", function () {
        fa.seek(seek_pos);
        expect(fa.tell()).toEqual(seek_pos);
    });
    it("Seeking from current position should work", function () {
        fa.seek(seek_pos);
        fa.seek(seek_pos, lib.SEEK_CUR);
        expect(fa.tell()).toEqual(2*seek_pos);
    });

  });

});

