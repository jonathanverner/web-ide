/*jshint unused: vars */
define(['lib/signals'], function(sig) {
  'use strict';

  describe('Library: Signals', function () {
    var obj = function(max_emit) {
          this.num_emitted = 0;
          this.signalA = sig.Signal("num emitted","max emit");
          this.emit_signal = function () {
              this.signalA.emit(num_emitted++,max_emit);
          }
          this.receive = function( arg1, arg2 ) {
              if (num_emitted < max_emit) this.signalA.emit_signal();
          }
          this.receiveBad = function (arg1) {
          }
    };

    it('A signal should only connect to a slot with the same number of arguments', function () {
        var objA = new obj(10);
        expect(function () { objA.signalA.connect( receiveBad, objA ); }).toThrow();
    });

  });

});
