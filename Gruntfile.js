module.exports = function(grunt) { 

	grunt.initConfig({

	  nodewebkit: {
	    options: {
	        platforms: ['win','osx'],
	        buildDir: './build', 
		    macIcns: './app/icon/icon.icns',
		    winIco: './app/icon/icon.ico',
	    },
	    src: ['./app/**/*'] 	       
	  }

	});

	grunt.loadNpmTasks('grunt-node-webkit-builder');

	grunt.registerTask('default', ['nodewebkit']);

}
