'use strict';

module.exports = {
  src: {
    options: {
      jshintrc: './src/.jshintrc'
    },
    files: {
      src: [
        './src/**/*.js',
      ]
    }
  },
  project: {
    options: {
      jshintrc: './.jshintrc'
    },
    files: {
      src: ['./Gruntfile.js', './grunt/**/*.js']
    }
  }
};
