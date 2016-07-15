/*! react-swf v1.0.6 | @syranide | MIT license */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['react', 'react-dom', 'react-dom/server', 'react-swf'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('react'), require('react-dom'), require('react-dom/server'), require('react-swf'));
  } else {
    root.ReactSWFCompat = factory(root.React, root.ReactDOM, root.ReactDOMServer, root.ReactSWF);
  }
}(this, function(React, ReactDOM, ReactDOMServer, ReactSWF) {
  'use strict';

  var PropTypes = React.PropTypes;

  function ReactSWFCompat(props) {
    React.Component.call(this, props);

    var that = this;
    this._containerRefCallback = function(c) {
      that._container = c;
    };
    this._swfRefCallback = function(c) {
      that._swf = c;
    };
  }

  ReactSWFCompat.prototype = Object.create(React.Component.prototype);
  ReactSWFCompat.prototype.constructor = ReactSWFCompat;
  Object.assign(ReactSWFCompat, React.Component);

  ReactSWFCompat.propTypes = {
    container: PropTypes.element.isRequired
  };

  ReactSWFCompat.prototype._createSWFElement = function() {
    var props = Object.assign({}, this.props);
    delete props.container;
    props.movie = props.src;
    props.ref = this._swfRefCallback;

    return React.createElement(ReactSWF, props);
  };

  ReactSWFCompat.prototype.getFPDOMNode = function() {
    return this._swf.getFPDOMNode();
  };

  ReactSWFCompat.prototype.componentDidMount = function() {
    var swfElement = this._createSWFElement();
    this._container.innerHTML = ReactDOMServer.renderToString(swfElement);
    ReactDOM.render(swfElement, this._container);
  };

  ReactSWFCompat.prototype.componentDidUpdate = function() {
    var swfElement = this._createSWFElement();
    ReactDOM.render(swfElement, this._container);
  };

  ReactSWFCompat.prototype.componentWillUnmount = function() {
    // IE8 leaks nodes if AS3 `ExternalInterface.addCallback`-functions remain.
    if (document.documentMode < 9) {
      var node = this.getFPDOMNode();

      // Node-methods are not enumerable in IE8, but properties are.
      for (var key in node) {
        if (typeof node[key] === 'function') {
          node[key] = null;
        }
      }
    }
  };

  ReactSWFCompat.prototype.render = function() {
    var containerProps = {
      ref: this._containerRefCallback
    };

    return React.cloneElement(this.props.container, containerProps, null);
  };

  return ReactSWFCompat;
}));
