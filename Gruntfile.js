module.exports = function(grunt) {

  grunt.initConfig({
    electron: {
      osx: {
        options: {
          name: 'Chrome DevTools',
          dir: 'app',
          out: 'build',
          version: '0.28.2',
          platform: 'darwin',
          arch: 'x64'
        }
      },
      windows: {
        options: {
          name: 'Chrome DevTools',
          dir: 'app',
          out: 'build',
          version: '0.28.2',
          platform: 'win32',
          arch: 'x64'
        }
      }
    }
  })

  require('load-grunt-tasks')(grunt)

  grunt.registerTask('build', ['electron'])

}
