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

/*global ActiveXObject: false */

'use strict';


var cachedFPVersion;

/**
 * Get the installed Flash Player version.
 *
 * @return {?string} Version as X.Y.Z, null if not installed/enabled.
 */
function getFPVersion() {
  if (cachedFPVersion === undefined) {
    cachedFPVersion = null;
    
    if (navigator.plugins) {
      var plugin = navigator.plugins['Shockwave Flash'];
      if (plugin) {
        var mimeType = navigator.mimeTypes['application/x-shockwave-flash'];
        if (mimeType && mimeType.enabledPlugin) {
          var matches = plugin.description
            .match(/^Shockwave Flash (\d+)(?:\.(\d+))?(?: r(\d+))?/);
          
          cachedFPVersion =
            matches[1] + '.' + (matches[2] || 0) + '.' + (matches[3] || 0);
        }
      }
    }
    if (window.ActiveXObject) {
      try {
        var axObject = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
        if (axObject) {
          cachedFPVersion = axObject.GetVariable('$version')
            .match(/^WIN (\d+),(\d+),(\d+)/).slice(1).join('.');
        }
      }
      catch (e) {}
    }
  }
  
  return cachedFPVersion;
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


module.exports.getFPVersion = getFPVersion;
module.exports.isFPVersionSupported = isFPVersionSupported;
