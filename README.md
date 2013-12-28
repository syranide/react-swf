# [React](https://github.com/facebook/react)SWF

Shockwave Flash Player component for [React](https://github.com/facebook/react)

* Just 1KB gzipped
* An object can be passed to `flashVars`
* Solved IE8 memory leaks when using `flash.external.ExternalInterface.addCallback`

## Examples

React JSX:

```js
/** @jsx React.DOM */
var MyComponent = React.createClass({
  render: function() {
    var swf = require('react-swf');
    
    return (
      <swf src="example.swf" 
           width="300"
           height="200"
           wmode="transparent"
           flashVars={{var1: 'A', var2: 1}} />
    );
  }
});
```

### JavaScript
```js
var ReactSWF = require('react-swf');

var MyComponent = React.createClass({
  render: function() {
    return ReactSWF({
      src: 'example.swf',
      width: 300,
      height: 200,
      wmode: 'transparent',
      flashVars: {var1: 'A', var2: 1}
    });
  }
});
```

### Utilities
```js
var utils = require('react-swf/utils');

if (utils.isFPVersionSupported('10.0')) {
  // success, go ahead and render the ReactSWF-component
} else {
  // not supported, use fallback or direct to Flash Player installer
  console.log('Flash Player ' + utils.getFPVersion()) + ' is not supported');
}

```
## Component attributes

```
src {string}
width {number}
height {number}
play {boolean}
loop {boolean}
menu {boolean}
quality {enum}  =  low, autolow, autohigh, medium, high, best
scale {enum}  =  default, noborder, exactfit, noscale
align {enum}  =  l, t, r
salign {enum}  =  l, t, r, tl, tr
bgColor {color}  =  #RRGGBB
wmode {enum}  =  window, direct, opaque, transparent, gpu
base {url}
allowScriptAccess {boolean}
allowFullScreen {boolean}
fullScreenAspectRatio {enum}  =  portait, landscape
flashVars {object|string}
```

http://helpx.adobe.com/flash/kb/flash-object-embed-tag-attributes.html

## Utility functions

```
require('react-swf/utils')

getFPVersion()
  Detect installed Flash Player version. Result is cached.
  {string} return 'X.Y.Z'-version, or null.

isFPVersionSupported(version)
  Detect if installed Flash Player version meets requirements.
  {string} version 'X.Y.Z' or 'X.Y' or 'X'-version.
  {boolean} return True if version is supported.
```
