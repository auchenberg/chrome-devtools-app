module.exports = function(grunt) {
    var os = require('os');
    var osType = os.type().toLowerCase();

    grunt.initConfig({

        nodewebkit: {
            options: {
                platforms: ['osx', 'win'],
                buildDir: './build',
                macIcns: './app/icon/logo.icns',
                winIco: './app/icon/logo.ico'
            },
            src: ['./app/**/*']
        },

        shell: {
            runApp: {
                command: function() {
                    switch(osType) {
                        case 'darwin':
                            return '/Applications/nwjs.app/Contents/MacOS/nwjs ./app'  
                        case 'windows_nt':
                            return '\"build\\Chrome DevTools\\win32\\Chrome DevTools.exe\"'     
                        default:
                            grunt.warn('No task for platform %s', os.type());
                            return;
                    }
                }
            },
            runAppDebug:  {
                    command:function(){
                    switch(osType) {
                        case 'darwin':
                            return '/Applications/nwjs.app/Contents/MacOS/nwjs ./app -remote-debugging-port=9222'  
                        case 'windows_nt':
                            return '\"build\\Chrome DevTools\\win32\\Chrome DevTools.exe\" -remote-debugging-port=9222'     
                        default:
                            grunt.warn('No task for platform %s', os.type());
                            return;
                    }
                }
            }
        }

    });

    require('load-grunt-tasks')(grunt);
    grunt.registerTask('build', ['nodewebkit']);
    grunt.registerTask('run', ['shell:runApp']);
    grunt.registerTask('runDebug', ['shell:runAppDebug']);

}
