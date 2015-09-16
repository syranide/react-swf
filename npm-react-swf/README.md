## ReactSWF ![](https://img.shields.io/npm/v/react-swf.svg)

Shockwave Flash Player component for React. GCC `ADVANCED` optimizations compatible.

Supports all browsers supported by React.

Depends on [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#Polyfill_for_non-ES6_browsers) and [`Object.assign()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill)

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
var returnValue = ref.getFPDOMNode().myEICallback(...);
```

## Breaking changes

#### 0.12.3

* Depends on `Object.assign()`, [polyfills are available.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill)

#### 0.11.0

* React 0.13 components no longer support `ref.getDOMNode()`, use `ref.getFPDOMNode()` instead.
* Depends on `Object.is()`, [polyfills are available](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is#Polyfill_for_non-ES6_browsers).

## Properties

Standard DOM properties are forwarded to the underlying `<object>`.

Changes to props cannot be and are not reflected by an already mounted SWF (except for `width` and `height`). You must manually provide a computed `key` to ensure the component is reset when appropriate. Beware, this also applies to `src`.

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

Detailed explanation of most properties found at [[Flash OBJECT and EMBED tag attributes]](http://helpx.adobe.com/flash/kb/flash-object-embed-tag-attributes.html).

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

#### Security flaws
```
Escape object key characters for FP:
"&" => "&amp;"
"<" => "&lt;"
"\"" => "&quot;"

Escape object key characters for JS:
"\r" => "\\r"
"\"" => "\\\""
+ wrap key string with "\""
identifiers with keyword names must also be quoted for JS

Escape string characters for JS:
0x005C => "\\\\" (Backslash)
0x2028 => "\\u2028" (Line separator)
0x2029 => "\\u2029" (Paragraph separator)

Invalid UTF8 characters for FP and JS:
0x0000        (NULL character)
0xD800-0xDFFF (Non private use surrogates)
0xFDD0-0xFDEF (Non-characters)
0xFFFE-0xFFFF (Non-characters)
remove or replace with "\uFFFD" (replacement character)
can only be produced by String.fromCharCode(c) in FP, not "\uXXXX" (exception: 0x0000)
```

This list *may* be incomplete.

#### ExternalInterface.addCallback

Returned strings should be encoded using `StringForJS.encode`.

You must provide a unique DOM `id` to `ReactSWF` for IE8-10.

```
<ReactSWF id="my_guid_123" ... />
```

#### ExternalInterface.call

String arguments should be encoded using `StringForJS.encode`.

#### StringForJS.encode

The Flash run-time does not sufficiently encode strings passed to JavaScript. This can cause run-time errors, string corruption or character substitution to occur. Encoded strings are transparently decoded by the JavaScript run-time.

```as3
public class StringForJS {
  private static var UNSAFE_CHARS_REGEX:RegExp = new RegExp(
    // NULL-char (0x00) and backslash (0x5C)
    "[\\x00\\\\" +
    // Line separator (0x2028), paragraph separator (0x2029)
    "\u2028-\u2029" +
    // Non private use surrogates (0xD800 - 0xDFFF)
    String.fromCharCode(0xD800) + "-" + String.fromCharCode(0xDFFF) +
    // Non-characters (0xFDD0 - 0xFDEF)
    String.fromCharCode(0xFDD0) + "-" + String.fromCharCode(0xFDEF) +
    // Non-characters (0xFFFE + 0xFFFF)
    String.fromCharCode(0xFFFE) + String.fromCharCode(0xFFFF) + "]",
    "g"
  );

  private static function unsafeCharEscaper():String {
    switch (arguments[0]) {
      case "\u0000": return "\\0";
      case "\u005C": return "\\\\";
      case "\u2028": return "\\u2028";
      case "\u2029": return "\\u2029";
      default:       return "\uFFFD";
    };
  }

  // Encode unsafe strings for use with ExternalInterface. Invalid characters
  // are substituted by the Unicode replacement character.
  public static function encode(value:String):String {
    return value.replace(UNSAFE_CHARS_REGEX, unsafeCharEscaper);
  }
}
```
