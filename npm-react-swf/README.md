# react-swf

Shockwave Flash Player component for React.

Supports all browsers supported by React.

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
// Test if Flash Player version is supported and output the actual version.
if (ReactSWF.isFPVersionSupported('10.0')) {
  alert('Flash Player ' + ReactSWF.getFPVersion() + ' is installed');
}
```
```js
// ExternalInterface callbacks are invoked on the DOM node as usual.
var returnValue = thisOrRef.getFPNode().myEICallback(...);
```

## Breaking changes

#### 0.11.0

* React 0.13 components no longer support `swf.getDOMNode()`, use `swf.getFPDOMNode()` instead.
* Depends on `Object.is()`, [polyfills are available](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).

## Properties

Standard DOM properties are forwarded to the underlying `<object>`.

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

## API

#### Static methods

```
getFPVersion()
  returns {?string} 'X.Y.Z'-version or null.

  Returns installed Flash Player version. Result is cached.
  Must not be called in a non-browser environment.
```
```
isFPVersionSupported(versionString)
  versionString {string} 'X.Y.Z', 'X.Y' or 'X'.
  returns {boolean} true if supported.

  Returns if installed Flash Player meets version requirement.
  Must not be called in a non-browser environment.
```

#### Instance methods

```
getFPDOMNode()
  returns {?DOMNode} Flash Player object DOM node.

  Returns the Flash Player object DOM node.
  Should be prefered over `React.findDOMNode`.
```

## AS3 ExternalInterface

#### ExternalInterface.addCallback

Returned strings should be encoded using `encodeStringForJS`.

You must provide a unique DOM `id` to `ReactSWF` for IE8-10.

```
<ReactSWF id="my_guid_123" ... />
```

#### ExternalInterface.call

String arguments should be encoded using `encodeStringForJS`.

#### encodeStringForJS

The Flash run-time does not sufficiently encode strings passed to JavaScript. This can cause run-time errors, string corruption or character substitution to occur.

`encodeUnicodeStringForJS` should be used when the string is untrusted or contains special characters.
`encodeASCIIStringForJS` is a cheap alternative when the string is trusted or sufficiently sanitized.

Encoded strings are transparently decoded by the JavaScript run-time.

```as3
var ENCODE_UNSAFE_ASCII_CHARS_REGEX:RegExp = /\\/g;

// Encode unsafe ASCII-chars for use with ExternalInterface.
// \0 is not encoded and may throw a JavaScript error or corrupt the string.
function encodeASCIIStringForJS(value:String):String {
  return value.replace(ENCODE_UNSAFE_ASCII_CHARS_REGEX, '\\\\');
}
```
```as3
var ENCODE_UNSAFE_UNICODE_CHARS_REGEX:RegExp = new RegExp(
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

// Encode unsafe Unicode-chars for use with ExternalInterface.
// 0xD800-0xDFFF are considered invalid and may be substituted with 0xFFFD.
function encodeUnicodeStringForJS(value:String):String {
  return value.replace(ENCODE_UNSAFE_UNICODE_CHARS_REGEX, function():String {
    var charCode:Number = arguments[0].charCodeAt(0);
    return (
      charCode === 92 ? '\\\\' :
      charCode === 0 ? '\\0' : '\\u' + charCode.toString(16)
    );
  });
}
```
