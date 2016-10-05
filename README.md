# Three File Island

This is a simple npm package that allows you to temporarily mock out a javascript file
with a mock object. It does this by replacing the file on-disk with a mock one.
This is useful in situations where you need to "deeply" mock out
something, for e.g. if you have file a.js which in turn requires b.js which in turn
requires c.js, and you want to mock out c.js. There are other ways to do it, for
example [proxyquire's @global directive](https://github.com/thlorenz/proxyquire#globally-override-require),
but it doesn't work as well as it could: it bypasses the require cache, even for non-mocked modules
(which can cause state issues), and
you have to provide the file path relative to the file being tested, which means if multiple files from
different directories are being tested,
[you're going to have a bad time](https://cessnachick.files.wordpress.com/2015/08/youre-going-to-have-a-bad-time.png).

## Installation

Three file island is available in the `three-file-island` npm package, and can be
installed like any other package.

## Usage

### Obtaining the main object

You can access TFI by running `require('three-file-island')(__dirname);`.
It needs `__dirname` to resolve relative file paths properly.

### API

TFI Has 3 methods, `.mock`, `.reset`, and `.resetAll`. They are all asynchronous
and, by default, return a promise which resolves upon completion. If you wish to use
the "traditional" node callback style, you can provide a callback as an additional argument.
If there's an error, it will be passed to the callback.

#### tfi.mock(fileToMock, mockObj)

Mocks out the file specified by fileToMock (which can be either an absolute
or relative path) with mockObj. Calling `require('/path/to/mocked/file')` will-
return your mock object. mockObj does not need to be an object; it can be a
primitive, function, whatever. Closures and stuff will also be fine.

#### tfi.reset(fileToMock)

Resets a mocked file to it's pre-mocked state. It is very important to run this when you're done using the mock,
otherwise the mocked file will be broken even after your script finishes.

#### tfi.resetAll()

The same as tfi.reset, but automatically calls it for all mocked files. You might
want to run this at the end of your script as sort of an emergency cleanup.

### "I didn't run reset!"

If you accidentally forgot to run reset or resetAll after you were finished using your mock,
you can find the original version of the mocked file with a .tfitemp extension.
For example, if you're trying to mock /path/to/file.js, the original will be stored
at /path/to/file.js.tfitemp. Simply rename this back to file.js and you're set.

### The require cache

After you mock out or reset a file, if that file was cached by require, it will be removed from
the cache to prevent unexpected behavior. Other cached files will be left alone.

## Examples

Here is a basic example of Three File Island:

#### mock-me.js

```javascript
module.exports = hello =>
    hello + ' World!';
```

#### index.js

```javascript
const tfi = require('three-file-island')(__dirname);
const beforeMock = require('./mock-me.js');
// it has not been mocked yet
console.log(beforeMock('Goodbye')); // => "Goodbye World"
tfi.mock('./mock-me.js', {
    foo: 'bar',
})
.then(() => {
    const afterMock = require('./mock-me.js');
    console.log(afterMock.foo); // => "bar"
    return tfi.reset('./mock-me.js');
})
.then(() => {
    const finalMock = require('./mock-me.js');
    console.log(finalMock('Hello')); // => "Hello World!"
});
```

And here's what will be logged to the console:

```
Goodbye World!
bar
Hello World!
```

## Contributing

Feel free to open issues and pull requests. Please put in a few tests for whatever you add.
