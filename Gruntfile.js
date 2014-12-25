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

        browserSync: {
            bsFiles: {
                src : 'app/css/*.css'
            },
            options: {
                server: {
                    baseDir: "./app"
                }
            }
        },

        shell: {
            runApp: {
                command: '/Applications/node-webkit.app/Contents/MacOS/node-webkit ./app'
            }
        }        

    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('build', ['nodewebkit']);
    grunt.registerTask('server', ['browserSync']);
    grunt.registerTask('run', ['shell:runApp']);

}
