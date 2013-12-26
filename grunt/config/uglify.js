'use strict';

module.exports = {
  options: {
    banner: '/*! <%= pkg.title %> <%= pkg.version %> | (c) 2014 Andreas Svensson | MIT License */\n'
  },
  release: {
    files: {
      'build/react-swf.min.js': ['build/react-swf.js']
    }
  }
};
