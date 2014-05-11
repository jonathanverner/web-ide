define(["jq-console/jqconsole", "app/Signals"], function( jqc, s ) {
    return {
        Console:function (element) {
            var cel = document.createElement("div");
            cel.classList.add("jqconsole-elem");
            element.appendChild(cel);
            var c = new jqc.console(cel,"",">>> ","... ");
            var self = this;

            this.modes = {
                INPUT:0,
                OUTPUT:1,
                PROMPT:2
            };
            var mode = this.modes.OUTPUT;

            this.write = function (string, cls) {
                if ( mode == this.modes.OUTPUT ) c.Write(string, cls);
                else throw "Cannot write in mode "+mode;
            };

            this.readline = function (input_handler) {
                if ( mode != this.modes.OUTPUT ) throw "Cannot input in mode "+mode;
                mode = this.modes.INPUT;
                self = this
                c.Input(function (input) {
                    mode = self.modes.OUTPUT;
                    if (input_handler === undefined ) self.readline_finished.emit(input);
                    else input_handler(input);
                });
            };

            this.prompt = function() {
                if ( mode == this.modes.PROMPT ) return;
                if ( mode == this.modes.INPUT ) throw "Cannot prompt in input mode";
                mode = this.modes.PROMPT;
                c.Prompt(true, function(cmd) {
                    mode = self.modes.OUTPUT;
                    self.command_input.emit(cmd);
                }, this.test_multiline);
            };

            this.test_multiline = function (input) {
                return false; /* or Number @N --- adjust indent by @N */
            };

            this.command_input = new s.Signal("command");
            this.readline_finished = new s.Signal("input");

        }
    }
});

