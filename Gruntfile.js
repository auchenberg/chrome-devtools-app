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
                src : 'css/*.css'
            },
            options: {
                server: {
                    baseDir: "./app"
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-node-webkit-builder');
    grunt.loadNpmTasks('grunt-browser-sync');

    grunt.registerTask('build', ['nodewebkit']);
    grunt.registerTask('server', ['browserSync']);

}
