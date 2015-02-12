/*! react-swf v0.10.0 | @syranide | MIT license */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['react'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('react'));
  } else {
    root.ReactSWF = factory(root.React);
  }
}(this, function(React) {
  'use strict';

  var mimeTypeForFP = 'application/x-shockwave-flash';

  var paramsSupportedByFP = {
    'flashVars': 0, // {key: {string}} or "key=value&..."

    'allowFullScreen': 1, // true, false*
    'allowNetworking': 0, // all*, internal, none
    'allowScriptAccess': 0, // always, sameDomain, never

    'align': 0, // l, t, r
    'base': 0, // url
    'bgcolor': 0, // #RRGGBB
    'fullScreenAspectRatio': 0, // portrait, landscape
    'loop': 1, // true*, false
    'menu': 1, // true*, false
    'play': 1, // true*, false
    'quality': 0, // low, autolow, autohigh, medium, high, best
    'salign': 0, // l, t, r, tl, tr
    'scale': 0, // default*, noborder, exactfit, noscale
    'seamlessTabbing': 1, // true*, false
    'wmode': 0 // window*, direct, opaque, transparent, gpu
  };


  var ENCODE_FLASH_VARS_REGEX = /[\r%&+=]/g;

  var ENCODE_FLASH_VARS_LOOKUP = {
    '\r': '%0D',
    '%': '%25',
    '&': '%26',
    '+': '%2B',
    '=': '%3D'
  };

  function encodeFlashVarsStringReplacer(match) {
    return ENCODE_FLASH_VARS_LOOKUP[match];
  }

  function encodeFlashVarsString(string) {
    return ('' + string).replace(
      ENCODE_FLASH_VARS_REGEX,
      encodeFlashVarsStringReplacer
    );
  }

  function encodeFlashVarsObject(object) {
    // Push to array; faster and scales better than string concat.
    var output = [];

    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        var value = object[key];

        if (value != null) {
          output.push(
            encodeFlashVarsString(key) + '=' + encodeFlashVarsString(value)
          );
        }
      }
    }

    return output.join('&');
  }


  var installedFPVersion;

  /**
   * Detect and return installed Flash Player version. Result is cached.
   * Caution: Must not be called in a non-browser environment.
   *
   * @return {?string} 'X.Y.Z'-version or null.
   */
  function getFPVersion() {
    if (installedFPVersion === undefined) {
      installedFPVersion = null;

      var nav = navigator;
      var navPluginForFP = nav.plugins['Shockwave Flash'];
      var navMimeTypeForFP = nav.mimeTypes[mimeTypeForFP];

      if (navPluginForFP && navMimeTypeForFP && navMimeTypeForFP.enabledPlugin) {
        try {
          return installedFPVersion = (
            navPluginForFP
              .description
              .match(/(\d+)\.(\d+) r(\d+)/)
              .slice(1)
              .join('.')
          );
        } catch (e) {
        }
      }

      // ActiveXObject-fallback for IE8-10
      var ActiveXObject = window.ActiveXObject;

      if (ActiveXObject) {
        try {
          return installedFPVersion = (
            new ActiveXObject('ShockwaveFlash.ShockwaveFlash')
              .GetVariable('$version')
              .match(/(\d+),(\d+),(\d+)/)
              .slice(1)
              .join('.')
          );
        } catch (e) {
        }
      }
    }

    return installedFPVersion;
  }

  /**
   * Detect if installed Flash Player meets version requirement.
   * Caution: Must not be called in a non-browser environment.
   *
   * @param {string} versionString 'X.Y.Z', 'X.Y' or 'X'.
   * @return {boolean} true if supported.
   */
  function isFPVersionSupported(versionString) {
    var installedVersionString = getFPVersion();

    if (installedVersionString == null) {
      return false;
    }

    var installedVersionFields = installedVersionString.split('.');
    var requiredVersionFields = versionString.split('.');

    for (var i = 0; i < 3; i++) {
      var installedVersionNumber = +installedVersionFields[i];
      var requiredVersionNumber = +(requiredVersionFields[i] || 0);

      if (installedVersionNumber !== requiredVersionNumber) {
        return installedVersionNumber > requiredVersionNumber;
      }
    }

    return true;
  }


  var ReactSWF = React.createClass({
    statics: {
      getFPVersion: getFPVersion,
      isFPVersionSupported: isFPVersionSupported
    },

    getInitialState: function() {
      var props = this.props;

      // The only way to change Flash parameters or reload the movie is to update
      // the key of the ReactSWF element. This unmounts the previous instance and
      // reloads the movie. Store initial values to keep the DOM consistent.

      var params = {
        // IE8 requires the `movie` parameter.
        'movie': props.src
      };

      for (var key in paramsSupportedByFP) {
        if (props.hasOwnProperty(key)) {
          var value = props[key];

          if (value != null) {
            if (key === 'flashVars' && typeof value === 'object') {
              value = encodeFlashVarsObject(value);
            } else if (paramsSupportedByFP[key]) {
              // Force values to boolean parameters to be boolean.
              value = !!value;
            }

            params[key.toLowerCase()] = '' + value;
          }
        }
      }

      return {
        src: props.src,
        params: params
      };
    },

    shouldComponentUpdate: function(nextProps) {
      var prevProps = this.props;

      for (var key in prevProps) {
        // Ignore all Flash parameter props
        if (prevProps.hasOwnProperty(key) &&
            (!nextProps.hasOwnProperty(key) ||
              prevProps[key] !== nextProps[key]) &&
            !paramsSupportedByFP.hasOwnProperty(key)) {
          return true;
        }
      }

      for (var key in nextProps) {
        if (nextProps.hasOwnProperty(key) &&
            !prevProps.hasOwnProperty(key) &&
            !paramsSupportedByFP.hasOwnProperty(key)) {
          return true;
        }
      }

      return false;
    },

    componentWillUnmount: function() {
      // IE8 leaks nodes if AS3 `ExternalInterface.addCallback`-functions remain.
      if (document.documentMode < 9) {
        var node = this.getDOMNode();

        // Node-methods are not enumerable in IE8, but properties are.
        for (var key in node) {
          if (typeof node[key] === 'function') {
            node[key] = null;
          }
        }
      }
    },

    render: function() {
      var props = this.props;
      var state = this.state;

      // AS3 `ExternalInterface.addCallback` requires a unique node ID in IE8-10.
      // There is however no isolated way to play nice with server-rendering, so
      // we must leave it up to the user.

      var objectProps = {
        children: [],
        type: mimeTypeForFP,
        data: state.src,
        // Discard `props.src`
        src: null
      };

      for (var key in props) {
        // Ignore props that are Flash parameters or managed by this component.
        if (props.hasOwnProperty(key) &&
            !paramsSupportedByFP.hasOwnProperty(key) &&
            !objectProps.hasOwnProperty(key)) {
          objectProps[key] = props[key];
        }
      }

      var objectChildren = objectProps.children;

      for (var key in state.params) {
        objectChildren.push(
          React.DOM.param({
            key: key,
            name: key,
            value: state.params[key]
          })
        );
      }

      // Push `props.children` to the end of the children, React will generate a
      // key warning if there are multiple children. This is preferable for now.
      if (props.children != null) {
        objectChildren.push(props.children);
      }

      return React.DOM.object(objectProps);
    }
  });

  return ReactSWF;
}));
