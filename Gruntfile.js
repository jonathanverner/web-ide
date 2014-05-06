module.exports = function(grunt) {
    grunt.initConfig({
        intern: {
            someReleaseTarget: {
                options: {
                    runType: 'client', // defaults to 'client'
                    config: 'tests/intern',
                    reporters: [ 'console', 'lcov' ],
                    suites: [ 'tests/MemStore' ]
                }
            }
        }
    });

    // Load the Intern task
    grunt.loadNpmTasks('intern');

    // Register a test task that uses Intern
    grunt.registerTask('test', [ 'intern' ]);

    // By default we just test
    grunt.registerTask('default', [ 'test' ]);
};
