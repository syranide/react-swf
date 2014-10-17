# react-swf

Shockwave Flash Player component for React. Only 1.2kb.

```
<ReactSWF
  src="example.swf"
  id="guid_001"
  width="300"
  height="200"
  wmode="transparent"
  flashVars={{foo: 'A', bar: 1}}
/>
```
```js
if (ReactSWF.isFPVersionSupported('10.0')) {
  console.log('Flash Player ' + ReactSWF.getFPVersion() + ' is supported');
}
```

## Installation

#### Universal script [(minified)](//raw.githubusercontent.com/syranide/react-swf/v0.9.2/react-swf.min.js) [(source)](//raw.githubusercontent.com/syranide/react-swf/v0.9.2/react-swf.js)

```
<!-- Global module -->
<script src="react-swf.js"></script>
```
```
// AMD module
define(['react-swf'], function(ReactSWF) { });
```
```
// CommonJS module
var ReactSWF = require('react-swf');
```

#### Package managers

```
# CommonJS module
npm install --save react-swf
```
```
# Universal module
bower install --save react-swf
```

## Special properties

Detailed explanation of most properties found at [[Flash OBJECT and EMBED tag attributes]](http://helpx.adobe.com/flash/kb/flash-object-embed-tag-attributes.html).

```
src {string} [required]
width {number}
height {number}
```
```
flashVars {object|string} - {key: {string}}, "key=value&..."
```
```
allowFullScreen {boolean} - true, false*
allowNetworking {enum} - all*, internal, none
allowScriptAccess {enum} - always, sameDomain*, never
```
```
align {enum} - l, t, r
base {string}
bgcolor {string} - #RRGGBB
fullScreenAspectRatio {enum} - portrait, landscape
loop {boolean} - true*, false
menu {boolean} - true*, false
play {boolean} - true*, false
quality {enum} - low, autolow, autohigh, medium, high, best
salign {enum} - l, t, r, tl, tr
scale {enum} - default*, noborder, exactfit, noscale
seamlessTabbing {boolean} - true*, false
wmode {enum} - window*, direct, opaque, transparent, gpu
```

## ExternalInterface

#### ExternalInterface.addCallback

If the movie uses `ExternalInterface.addCallback` you must provide a globally unique DOM `id` to `ReactSWF` for IE8-10. This is not automatic as there exists no isolated mechanism that can guarantee the creation of IDs that are identical on both server and client, yet unique.

```
<ReactSWF id="guid_001" ... />
```

#### ExternalInterface.call

If the movie uses `ExternalInterface.call` it should use one of the following ActionScript 3 functions to safeguard against run-time errors and string corruption from unsafe chars. Encoded strings are automatically decoded by the JavaScript run-time.

```as3
var matchUnsafeSlashChar:RegExp = /\\/g;

// Encode unsafe ASCII-chars for ExternalInterface.call.
// \0 is not encoded and may throw a JavaScript error or corrupt the string.
function encodeASCIIStringForJS(value:String):String {
  return value.replace(matchUnsafeSlashChar, '////');
}
```
```as3
var matchAnyUnsafeChars:RegExp = new RegExp(
  // Backslash (\) and NULL-char (\0)
  '[\\\\\\0' +
  // Line separator (0x2028), paragraph separator (0x2029)
  String.fromCharCode(0x2028) + String.fromCharCode(0x2029) +
  // Non-characters (0xFDD0 - 0xFDEF)
  String.fromCharCode(0xfdd0) + '-' + String.fromCharCode(0xfdef) +
  // Non-characters (0xFFFE + 0xFFFF)
  String.fromCharCode(0xfffe) + String.fromCharCode(0xffff) + ']',
  'g'
);

// Encode unsafe Unicode-chars for ExternalInterface.call.
// 0xD800-0xDFFF are considered invalid and may be replaced with 0xFFFD.
function encodeUnicodeStringForJS(value:String):String {
  return value.replace(matchAnyUnsafeChars, function():String {
    var charCode:Number = arguments[0].charCodeAt(0);
    return (
      charCode === 92 ? '\\\\' :
      charCode === 0 ? '\\0' : '\\u' + charCode.toString(16)
    );
  });
}
```
