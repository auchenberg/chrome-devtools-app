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
                command: '/Applications/nwjs.app/Contents/MacOS/nwjs ./app'
            },
            runAppDebug: {
                command: '/Applications/nwjs.app/Contents/MacOS/nwjs ./app --remote-debugging-port=9222'
            }
        }

    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('build', ['nodewebkit']);
    grunt.registerTask('run', ['shell:runApp']);
    grunt.registerTask('runDebug', ['shell:runAppDebug']);

}
