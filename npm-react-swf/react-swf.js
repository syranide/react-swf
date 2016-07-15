/*! react-swf v1.0.6 | @syranide | MIT license */

'use strict';

var React = require('react');
var PropTypes = React.PropTypes;

/*
  flashVars = {key: string} or "key=value&..."

  allowFullScreen = true, false*
  allowFullScreenInteractive = true, false*
  allowNetworking = all*, internal, none
  allowScriptAccess = always, sameDomain, never

  align = l, t, r
  base = url
  bgcolor = #RRGGBB
  browserZoom = scale*, noscale
  fullScreenAspectRatio = portrait, landscape
  loop = true*, false
  menu = true*, false
  play = true*, false
  quality = low, autolow, autohigh, medium, high, best
  salign = l, t, r, tl, tr
  scale = default*, noborder, exactfit, noscale
  seamlessTabbing = true*, false
  wmode = window*, direct, opaque, transparent, gpu
*/

var supportedFPParamNames = {
  movie: 'movie', // react-swf/compat for IE8

  flashVars: 'flashvars',

  allowFullScreen: 'allowfullscreen',
  allowFullScreenInteractive: 'allowfullscreeninteractive',
  allowNetworking: 'allownetworking',
  allowScriptAccess: 'allowscriptaccess',

  align: 'align',
  base: 'base',
  bgcolor: 'bgcolor',
  browserZoom: 'browserzoom',
  fullScreenAspectRatio: 'fullscreenaspectratio',
  loop: 'loop',
  menu: 'menu',
  play: 'play',
  quality: 'quality',
  salign: 'salign',
  scale: 'scale',
  seamlessTabbing: 'seamlesstabbing',
  wmode: 'wmode'
};

var booleanFPParams = {
  allowFullScreen: true,
  allowFullScreenInteractive: true,
  loop: true,
  menu: true,
  play: true,
  seamlessTabbing: true
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


/** @constructor */
function ReactSWF(props) {
  React.Component.call(this, props);

  var that = this;
  this._refCallback = function(c) {
    that._node = c;
  };

  // The only way to change Flash parameters or reload the movie is to update
  // the key of the ReactSWF element. This unmounts the previous instance and
  // reloads the movie. Store initial values to keep the DOM consistent.

  var params = {};

  for (var key in supportedFPParamNames) {
    if (supportedFPParamNames.hasOwnProperty(key) &&
        props.hasOwnProperty(key)) {
      var value = props[key];

      if (value != null) {
        var name = supportedFPParamNames[key];

        if (name === 'flashvars' && typeof value === 'object') {
          value = encodeFlashVarsObject(value);
        } else if (booleanFPParams.hasOwnProperty(key)) {
          // Force boolean parameter arguments to be boolean.
          value = !!value;
        }

        params[name] = '' + value;
      }
    }
  }

  this._node = null;
  this.state = {
    src: props.src,
    params: params
  };
}

ReactSWF.prototype = Object.create(React.Component.prototype);
ReactSWF.prototype.constructor = ReactSWF;
Object.assign(ReactSWF, React.Component);

ReactSWF.propTypes = {
  src: PropTypes.string.isRequired,
  movie: PropTypes.string, // react-swf/compat for IE8

  flashVars: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),

  allowFullScreen: PropTypes.bool,
  allowFullScreenInteractive: PropTypes.bool,
  allowNetworking: PropTypes.oneOf(['all', 'internal', 'none']),
  allowScriptAccess: PropTypes.oneOf(['always', 'sameDomain', 'never']),

  align: PropTypes.oneOf(['l', 't', 'r']),
  base: PropTypes.string,
  bgcolor: PropTypes.string,
  browserZoom: PropTypes.oneOf(['scale', 'noscale']),
  fullScreenAspectRatio: PropTypes.oneOf(['portrait', 'landscape']),
  loop: PropTypes.bool,
  menu: PropTypes.bool,
  play: PropTypes.bool,
  quality: PropTypes.oneOf(['low', 'autolow', 'autohigh', 'medium', 'high', 'best']),
  salign: PropTypes.oneOf(['l', 't', 'r', 'tl', 'tr']),
  scale: PropTypes.oneOf(['default', 'noborder', 'exactfit', 'noscale']),
  seamlessTabbing: PropTypes.bool,
  wmode: PropTypes.oneOf(['window', 'direct', 'opaque', 'transparent', 'gpu'])
};

ReactSWF.prototype.getFPDOMNode = function() {
  return this._node;
};

ReactSWF.prototype.shouldComponentUpdate = function(nextProps) {
  var prevProps = this.props;

  for (var key in prevProps) {
    // Ignore all Flash parameter props
    if (prevProps.hasOwnProperty(key) &&
        !supportedFPParamNames.hasOwnProperty(key) &&
        (!nextProps.hasOwnProperty(key) ||
         !Object.is(prevProps[key], nextProps[key]))) {
      return true;
    }
  }

  for (var key in nextProps) {
    if (nextProps.hasOwnProperty(key) &&
        !supportedFPParamNames.hasOwnProperty(key) &&
        !prevProps.hasOwnProperty(key)) {
      return true;
    }
  }

  return false;
};

ReactSWF.prototype.render = function() {
  var props = this.props;
  var state = this.state;

  // AS3 `ExternalInterface.addCallback` requires a unique node ID in IE8-10.
  // There is however no isolated way to play nice with server-rendering, so
  // we must leave it up to the user.

  var objectProps = {
    ref: this._refCallback,
    children: [],
    type: 'application/x-shockwave-flash',
    data: state.src,
    // Discard `props.src`
    src: null
  };

  for (var key in props) {
    // Ignore props that are Flash parameters or managed by this component.
    if (props.hasOwnProperty(key) &&
        !supportedFPParamNames.hasOwnProperty(key) &&
        !objectProps.hasOwnProperty(key)) {
      objectProps[key] = props[key];
    }
  }

  var objectChildren = objectProps.children;

  for (var name in state.params) {
    objectChildren.push(
      React.createElement('param', {
        key: name,
        name: name,
        value: state.params[name]
      })
    );
  }

  // Push `props.children` to the end of the children, React will generate a
  // key warning if there are multiple children. This is preferable for now.
  if (props.children != null) {
    objectChildren.push(props.children);
  }

  return React.createElement('object', objectProps);
};

module.exports = ReactSWF;
