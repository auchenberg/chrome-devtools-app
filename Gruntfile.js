module.exports = function(grunt) { 

    grunt.initConfig({

        nodewebkit: {
            options: {
                platforms: ['osx'],
                buildDir: './build', 
                macIcns: './app/icon/logo.icns'
            },
            src: ['./app/**/*']
        },

        shell: {
            runApp: {
                command: '/Applications/node-webkit.app/Contents/MacOS/node-webkit ./app'
            },
            runAppDebug: {
                command: '/Applications/node-webkit.app/Contents/MacOS/node-webkit ./app --remote-debugging-port=9222'
            }
        }        

    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('build', ['nodewebkit']);
    grunt.registerTask('run', ['shell:runApp']);
    grunt.registerTask('runDebug', ['shell:runAppDebug']);

}
