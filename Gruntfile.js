'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    compare_size: require('./grunt/config/compare_size'),
    copy: require('./grunt/config/copy'),
    jshint: require('./grunt/config/jshint'),
    uglify: require('./grunt/config/uglify')
  });

  grunt.loadNpmTasks('grunt-compare-size');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  
  grunt.registerTask('lint', ['jshint']);
  
  grunt.registerTask('build', ['build:release']);
  grunt.registerTask('build:release', ['copy', 'jshint', 'uglify', 'compare_size']);
  grunt.registerTask('build:debug', ['copy', 'jshint:src']);
  
  grunt.registerTask('default', ['build']);

};