# Three File Island

This is a simple npm package that allows you to temporarily mock out a javascript file
with a mock object. It does this by replacing the file on-disk with a mock one.
This is useful in situations where you need to "deeply" mock out
something, for e.g. if you have file a.js which in turn requires b.js which in turn
requires c.js, and you want to mock out c.js. There are other ways to do it, for
example [proxyquire's @global directive](https://github.com/thlorenz/proxyquire#globally-override-require),
but it doesn't work as well as it could: it bypasses the require cache (which can cause state issues), and
you have to provide the file path relative to the file being tested, which means if multiple files from
different directories are being tested,
[you're going to have a bad time](https://cessnachick.files.wordpress.com/2015/08/youre-going-to-have-a-bad-time.png).

# Installation

Three file island is available in the `three-file-island` npm package.
