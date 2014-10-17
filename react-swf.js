/*! react-swf v0.9.3 | @syranide | MIT license */

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

  var encodeStringRegexForFP = /[\r%&+=]/g;

  var encodeStringMapForFP = {
    '\r': '%0D',
    '%': '%25',
    '&': '%26',
    '+': '%2B',
    '=': '%3D'
  };

  var installedFPVersion;

  function encodeStringCallbackForFP(match) {
    return encodeStringMapForFP[match];
  }

  function encodeStringForFP(string) {
    return ('' + string).replace(
      encodeStringRegexForFP,
      encodeStringCallbackForFP
    );
  }

  function encodeObjectForFP(obj) {
    // Push to array, faster and scales better.
    var list = [];
    var i = 0;

    for (var key in obj) {
      if (obj[key] != null && obj.hasOwnProperty(key)) {
        list[i++] = (
          encodeStringForFP(key) + '=' +
          encodeStringForFP(obj[key])
        );
      }
    }

    return list.join('&');
  }

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

      if (navPluginForFP && navMimeTypeForFP &&
          navMimeTypeForFP.enabledPlugin) {
        try {
          return installedFPVersion = (
            navPluginForFP
              .description
              .match(/(\d+)\.(\d+) r(\d+)/)
              .slice(1)
              .join('.')
          );
        } catch (e) {}
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
        } catch (e) {}
      }
    }

    return installedFPVersion;
  }

  /**
   * Detect if installed Flash Player meets version requirement.
   * Caution: Must not be called in a non-browser environment.
   *
   * @param {string} versionString 'X.Y.Z', 'X.Y' or 'X'.
   * @return {boolean} True if supported.
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
      return {
        src: this.props.src,
        params: null,
      };
    },

    shouldComponentUpdate: function(nextProps) {
      var prevProps = this.props;

      for (var key in prevProps) {
        if (prevProps.hasOwnProperty(key) &&
            (!nextProps.hasOwnProperty(key) ||
              prevProps[key] !== nextProps[key]) &&
            !(key in paramsSupportedByFP)) {
          return true;
        }
      }

      for (var key in nextProps) {
        if (nextProps.hasOwnProperty(key) &&
            !prevProps.hasOwnProperty(key) &&
            !(key in paramsSupportedByFP)) {
          return true;
        }
      }

      return false;
    },

    componentWillMount: function() {
      var props = this.props;

      var params = {
        // IE8 requires the 'movie'-param.
        'movie': this.state.src
      };

      for (var key in paramsSupportedByFP) {
        var value = props[key];
        if (value != null && props.hasOwnProperty(key) && key !== 'flashVars') {
          // Force boolean parameters to be either "true" or false "false".
          params[key.toLowerCase()] = (
            paramsSupportedByFP[key] ?
              (value ? 'true' : 'false') :
              '' + value
          );
        }
      }

      var flashVars = props.flashVars;

      if (flashVars != null) {
        params['flashvars'] = (
          typeof flashVars === 'object' ?
            encodeObjectForFP(flashVars) :
            flashVars
        );
      }

      this.setState({
        params: params
      });
    },

    componentWillUnmount: function() {
      // IE8 leaks nodes if AS3 ExternalInterface.addCallback-functions remain.
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

      // AS3 ExternalInterface.addCallback requires a unique node ID in IE8-10.
      // There is however no isolated way to play nice with server-rendering, so
      // we must leave it up to the user.

      var objectProps = {
        type: mimeTypeForFP,
        data: state.src
      };

      for (var key in props) {
        if (!(key in paramsSupportedByFP || key in objectProps)) {
          objectProps[key] = props[key];
        }
      }

      var objectArguments = [objectProps];

      for (var key in state.params) {
        objectArguments.push(
          React.DOM.param({
            key: key,
            name: key,
            value: state.params[key]
          })
        );
      }

      if (props.children) {
        objectArguments.push(props.children);
      }

      return React.DOM.object.apply(null, objectArguments);
    }
  });

  return ReactSWF;
}));
