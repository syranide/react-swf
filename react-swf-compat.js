/*! react-swf v1.0.3 | @syranide | MIT license */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['react', 'react-dom', 'react-dom/server', 'react-swf'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('react'), require('react-dom'), require('react-dom-server'), require('react-swf'));
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
    var swfProps = Object.assign({}, this.props);
    swfProps.container = undefined;
    swfProps.movie = swfProps.src;
    swfProps.ref = this._swfRefCallback;

    return React.createElement(ReactSWF, swfProps);
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

  ReactSWFCompat.prototype.render = function() {
    var containerProps = {
      ref: this._containerRefCallback
    };

    return React.cloneElement(this.props.container, containerProps, null);
  };

  return ReactSWFCompat;
}));
