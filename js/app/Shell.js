
// Surrounds object methods with try ... catch blocks
// which rethrow exceptions as python exceptions
function pythonize_exceptions(object, exception_constructor) {};

function PythonFile() {
    File.call(this);

    this.writelines = function() {
        throw __builtins__.ValueError('writelines not implemented');
    };

    // Methods for use with the Python with keyword
    var lines = data.split('\n');
    this.__enter__ = function(){return this};
    this.__exit__ = function(){return false};
    this.__getattr__ = function(attr){return this[attr]};
    this.__iter__ = function(){return iter(lines)};
    this.__len__ = function(){return lines.length};
}

PythonFile.prototype = new File();
PythonFile.prototype.constructor = PythonFile;
pythonize_exceptions(PythonFile)



function Shell() {

    // Compiles the python code @src to javascript and runs it
    // @filename is the name of the file containing the @src
    // (accessible, e.g., via the __file__ global variable,
    //  see https://docs.python.org/2/library/runpy.html)
    this.exec = function (src, filename) {};

    // Evaluates the python expression @expression and
    // returns it as a javascript object
    this.eval = function (expression) {};

    // This function is called whenever the python code
    // calls input
    this.readline = function () {return ''};

    // The in/out streams available to the program
    // (i.e. sys.stdout, sys.stderr, sys.stdin)
    // Assign an appropriate function to stdin.readline
    // to make it functional
    this.stdout = new Stream('Shell.stdout');
    this.stderr = new Stream('Shell.stderr');
    this.stdin = new Stream('Shell.stdin');

    // Debugger (NOT IMPLEMENTED)
    this.break = function (filename, lineno) {};
    this.step = function () {};
    this.step_over = function () {};
    this.watch = function (expression) {};

    // Code Completion
    this.get_completions = function (string) {};

    var _output = function (text) {
        console.log("Shell output:"+text);
    };
    this._br = BRYTHON;
//     Sk.configure({output:_output});

    this.run_cmd = function( code, code_fname) {
        code_fname = (typeof code_fname !== 'undefined' ? code_fname : '<stdin>');
        this._br.vars.__main__.run(code);
    }

    this.reload = function( code, code_fname) {
        code_fname = (typeof code_fname !== 'undefined' ? code_fname : '<stdin>');
        var module = Sk.importMainWithBody(code_fname, false, code);
    }
    this.eval = function ( expression ) {
    }
}
