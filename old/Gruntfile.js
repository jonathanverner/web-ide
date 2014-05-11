module.exports = function(grunt) {
    grunt.initConfig(
    {
        'http-server': {
            'dev': {
                root:'.',
                port:8000,
                host:"127.0.0.1",
                showDir:true,
                autoIndex:true,
                defaultExt:"html",
                runInBackground:false
            }
        },
        intern: {
            someReleaseTarget: {
                options: {
                    runType: 'client', // defaults to 'client'
                    config: 'tests/intern',
                    reporters: [ 'console', 'lcov' ],
                    suites: [ 'tests/MemStore',
                              'tests/FileSystem'
                    ]
                }
            }
        },
        exec: {
          serve: {
              command: function (port, path) {
                  if (port === undefined) port = '8000';
                  if (path === undefined) path = './';
                  return "python python/server.py "+port+" "+path;
              }
          }
        }
    });

    //grunt.loadNpmTasks('grunt-http-server');
    //grunt.registerTask('serve',['http-server:dev']);

    grunt.loadNpmTasks('grunt-exec');



    // Load the Intern task
    grunt.loadNpmTasks('intern');

    // Register a test task that uses Intern
    grunt.registerTask('test', [ 'intern' ]);


    // By default we just test
    grunt.registerTask('default', [ 'test' ]);
};
