/**
 * Copyright (c) 2014 Andreas Svensson
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* jshint -W040 */
/*global ActiveXObject: false, define: false */

'use strict';

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['exports', 'react'], factory);
  } else if (typeof exports === 'object') {
    // CommonJS
    factory(exports, require('react'));
  } else {
    // Browser globals
    factory((root.ReactSWF = {}), root.React);
  }
}(this, function (exports, React) {
  
  var encodeFlashKeyValueLookup = {
    '\r': '%0D', '%': '%25', '&': '%26', '+': '%2B', '=': '%3D'
  };

  var objectParamNames = {
    play: true, loop: true, menu: true, quality: true, scale: true,
    bgColor: true, wmode: true, base: true, allowScriptAccess: true,
    allowFullScreen: true, fullScreenAspectRatio: true
  };

  var flashPlayerVersion;

  var nextUniqueObjectSwfId = 0;

  var memoryLeakWorkaround;


  /**
   * Get the installed Flash Player version.
   *
   * @return {?string} Version as X.Y.Z, null if not installed/enabled.
   */
  function getFPVersion() {
    if (flashPlayerVersion === undefined) {
      flashPlayerVersion = null;
      
      if ('plugins' in navigator) {
        var plugin = navigator.plugins['Shockwave Flash'];
        if (plugin) {
          var mimeType = navigator.mimeTypes['application/x-shockwave-flash'];
          if (mimeType && mimeType.enabledPlugin) {
            flashPlayerVersion = plugin.description
              .match(/(\d+)\.(\d+) r(\d+)/).slice(1).join('.');
          }
        }
      } else if ('ActiveXObject' in window) {
        try {
          var axObject = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
          if (axObject) {
            flashPlayerVersion = axObject.GetVariable('$version')
              .match(/(\d+),(\d+),(\d+)/).slice(1).join('.');
          }
        }
        catch (e) {}
      }
    }
    
    return flashPlayerVersion;
  }

  /**
   * Checks if the required Flash Player version is supported by the client.
   *
   * @param {string} version Required version.
   * @return {boolean} True if the version is supported.
   */
  function isFPVersionSupported(version) {
    var supportedVersion = getFPVersion();
    
    if (supportedVersion === null) {
      return false;
    }
    
    var supportedVersionArray = supportedVersion.split('.');
    var requiredVersionArray = version.split('.');
    
    for (var i = 0; i < requiredVersionArray.length; i++) {
      if (+supportedVersionArray[i] > +requiredVersionArray[i]) {
        return true;
      }
      if (+supportedVersionArray[i] < +requiredVersionArray[i]) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Encodes text for safe transport through flashVars.
   *
   * @param {*} text Text value to encode.
   * @return {string} An encoded string.
   */
  function encodeFlashKeyValue(string) {
    // Encode \r or it may be normalized into \n 
    return ('' + string).replace(/[\r%&+]/g, function(match) {
      return encodeFlashKeyValueLookup[match];
    });
  }


  function encodeFlashVarsObject(obj) {
    // Pushing encoded key-values to an array instead of immediately
    // concatenating is faster and scales better with large values.
    var list = [];
    
    for (var key in obj) {
      list.push(
        encodeFlashKeyValue(key) + '=' +
        encodeFlashKeyValue(obj[key])
      );
    }
    
    return list.join('&');
  }

  var swf = React.createClass({
    getInitialState: function() {
      return {
        // flash.external.ExternalInterface.addCallback requires a unique id
        id: nextUniqueObjectSwfId++
      };
    },
    componentWillUnmount: function() {
      // IE8: leaks memory if all ExternalInterface-callbacks have not been
      // removed. Only IE implements readyState, hasOwnProperty does not exist
      // for DOM nodes in IE8.
      
      if (memoryLeakWorkaround === undefined) {
        memoryLeakWorkaround =
          'readyState' in document && !('hasOwnProperty' in document);
      }
      if (memoryLeakWorkaround) {
        this._cleanup();
      }
    },
    _cleanup: function() {
      var node = this.getDOMNode();
      
      for (var key in node) {
        if (typeof node[key] === 'function') {
          node[key] = null;
        }
      }
    },
    render: function() {
      var params = [];
      
      // IE8: requires the use of the movie param instead of src
      params.push(
        React.DOM.param({
          key: 'movie',
          name: 'movie',
          value: this.props.src
        })
      );
      
      for (var key in this.props) {
        if (objectParamNames[key]) {
          params.push(
            React.DOM.param({
              key: key,
              name: key,
              value: this.props[key]
            })
          );
        }
      }
      
      var flashVars = this.props.flashVars;
      
      if (flashVars != null) {
        var encodedFlashVars;
        if (typeof flashVars === 'string') {
          encodedFlashVars = flashVars;
        } else {
          encodedFlashVars = encodeFlashVarsObject(flashVars);
        }
        
        params.push(
          React.DOM.param({
            key: 'flashVars',
            name: 'flashVars',
            value: encodedFlashVars
          })
        );
      }
      
      return this.transferPropsTo(
        React.DOM.object({
          type: 'application/x-shockwave-flash',
          id: '__react_swf_' + this.state.id,
          key: this.props.src,
          data: this.props.src
        }, params)
      );
    }
  });


  module.exports.getFPVersion = getFPVersion;
  module.exports.isFPVersionSupported = isFPVersionSupported;

  module.exports.DOM = {};
  module.exports.DOM.swf = swf;
  
}));
