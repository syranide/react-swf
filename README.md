# ReactSWF 0.7.0

Shockwave Flash Player component for [React](https://github.com/facebook/react)

Easy installation with `react-swf.min.js`, `npm install react-swf` or `bower install --save react-swf`.

* Browser bundle has optional CommonJS/AMD module loader support
* Only ~1KB gzipped
* An object can be passed to `flashVars` and is automatically encoded
* Solves IE8 memory leaks when using `flash.external.ExternalInterface.addCallback`

## Examples

#### React JSX example

```
<ReactSWF
  src="example.swf" 
  width="300"
  height="200"
  wmode="transparent"
  flashVars={{var1: 'A', var2: 1}} />
```

#### JavaScript example

```
ReactSWF({
  src: 'example.swf',
  width: 300,
  height: 200,
  wmode: 'transparent',
  flashVars: {var1: 'A', var2: 1}
})
```

#### Flash Player detection

```
if (ReactSWF.isFPVersionSupported('10.0')) {
  // success, go ahead and render the ReactSWF-component
} else {
  // not supported, use fallback or direct to Flash Player installer
  console.log('Flash Player ' + ReactSWF.getFPVersion()) + ' is not supported');
}
```

## Instructions

#### Browser bundle (standalone)

You are using `react-swf.min.js`

Simply include it with `<script src="react-swf.min.js"></script>`, it will be available through the global `ReactSWF`.

#### Browser bundle (CommonJS/AMD)

Simply include it with `<script src="react-swf.min.js"></script>`, require it with `var ReactSWF = require('react-swf')`.

#### Node, NPM-package

Simply install it with `npm install react-swf`, require it with `var ReactSWF = require('react-swf')`.

#### Bower-package

Simply install it with `bower install --save react-swf`, use your preferred method above.

## Documentation

#### ReactSWF attributes

Detailed explanation of each attribute is found on [Flash OBJECT and EMBED tag attributes](http://helpx.adobe.com/flash/kb/flash-object-embed-tag-attributes.html).

```
src {string} [required]
width {number}
height {number}

wmode {enum}
flashVars {object|string}

base {string}
menu {boolean}
play {boolean}
loop {boolean}
quality {enum}
scale {enum}
align {enum}
salign {enum}
bgColor {color}
fullScreenAspectRatio {enum}

allowFullScreen {boolean}
allowScriptAccess {boolean}
```

##### wmode = transparent

Is useful for enabling transparent Flash-content to blend seamlessly into a page, beware that there's a significant Flash-performance penalty associated with it so choose wisely.

##### flashVars = {object}

Allows sending a key-value object during *creation* that becomes available in ActionScript through `value = loaderInfo.parameters[key]`, roughly 64KB of serialized data is supported by Flash Player. Optionally, you can provide your own *encoded* string to be sent as-is to Flash Player.

##### allowScriptAccess = false

Prevents untrusted Flash-content from accessing sensitive information through browser script execution through `flash.external.ExternalInterface.call`.

====

#### Utility functions

These functions are available statically through `ReactSWF.*`.

```
getFPVersion()
  Detect installed Flash Player version. Result is cached.
  {?string} return 'X.Y.Z'-version, or null.

isFPVersionSupported(version)
  Detect if installed Flash Player version meets requirements.
  {string} version 'X.Y.Z' or 'X.Y' or 'X'-version.
  {boolean} return True if version is supported.
```
