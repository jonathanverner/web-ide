define(["lib/utils", "lib/exceptions"],function(utils,EX) {
    var Exc = EX.register("signals");
    var consts = {};

    var Signal = function() {
            var slots = [];
            var arg_len = arguments.length;
            var recursion_check = 0;


            // Connects signal handler @slot to this signal
            this.connect = function(slot, object) {
                if (slot.length > arg_len) throw new Exc("Wrong slot signature ("+slot.length+" instead of "+arg_len+").");
                slots.push({s:slot,o:object});
                if (slot.__signals__ === undefined) slot.__signals__ = [];
                slot.__signals__.push(this);
            }
            this.emit = function () {
                var i;
                if (arguments.length != arg_len) throw new Exc("Wrong signal signature (expecting "+arg_len+" got "+ arguments.length+" arguments");
                for(i = 0; i < slots.length; i++) {
                        if ( recursion_check > 3 ) throw new Exc("Recursion depth exceeded limit "+recursion_check);
                        recursion_check++;
                        slots[i].s.apply(slots[i].o,arguments);
                        recursion_check--;
                }
            }
            this.disconnect = function(slot) {
                var i,nslots = [];
                for(i = 0; i < slots.length; i++) {
                    if (! slots[i].s === slot) nslots.push(slots[i]);
                }
                slots = nslots;
            }
            this.disconnect_all = function() {
                slots = [];
            }
    };
    ret = {
        disconnect_all_handlers: function(obj) {
            var i;
            for(attr in obj) {
                if (obj[attr].hasOwnProperty("__signals__") ) {
                for(i=0;i<obj[attr].__signals__.length;i++) {
                    obj[attr].__signals__.disconnect(obj[attr]);
                }
                }
            }
        },
        disconnect_all_signals: function(obj) {
            for( attr in obj ) {
                if (obj[attr] instanceof Signal) obj[attr].disconnect_all();
            }
        },
        Signal: Signal
    }

    utils.add_properties(ret);
    return ret;
});
