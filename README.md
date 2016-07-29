# stream-combiner2-withopts

[![Build Status][ci-master]][travis-ci]
[![Dependency Status][dependency]][david]
[![devDependency Status][dev-dependency]][david]
[![Downloads][downloads]][npm]

This is an extension of [stream-combiner2](https://npmjs.org/package/stream-combiner2), which is a sequel to
[stream-combiner](https://npmjs.org/package/stream-combiner)
for streams3.  This extension takes any options and passes them along to the stream constructors.

[![NPM][npm-stats]][npm]

``` js
var Combine = require('stream-combiner2-withopts')
```

## Combine (stream1,...,streamN, opts)

Turn a pipeline into a single stream. `Combine` returns a stream that writes to the first stream
and reads from the last stream. 

Streams1 streams are automatically upgraded to be streams3 streams.

Listening for 'error' will recieve errors from all streams inside the pipe.

'opts' is an optional options object that will be passed to the stream constructors.

`.unwrap()` is available on the combined stream, to unbind and unpipe the streams for reuse and cleanup.

```js
var Combine = require('stream-combiner2-withopts')
var es      = require('event-stream')

var combined = Combine(                   // connect streams together with `pipe`
  process.openStdin(),                    // open stdin
  es.split(),                             // split stream to break on newlines
  es.map(function (data, callback) {      // turn this async function into a stream
    var repr = inspect(JSON.parse(data))  // render it nicely
    callback(null, repr)
  }),
  process.stdout                          // pipe it to stdout !
)
...
combined.unwrap()                         // disconnect pipes and events
```

## License

MIT

  [ci-master]: https://img.shields.io/travis/nextorigin/stream-combiner2-withopts/master.svg?style=flat-square
  [travis-ci]: https://travis-ci.org/nextorigin/stream-combiner2-withopts
  [dependency]: https://img.shields.io/david/nextorigin/stream-combiner2-withopts.svg?style=flat-square
  [david]: https://david-dm.org/nextorigin/stream-combiner2-withopts
  [dev-dependency]: https://img.shields.io/david/dev/nextorigin/stream-combiner2-withopts.svg?style=flat-square
  [david-dev]: https://david-dm.org/nextorigin/stream-combiner2-withopts#info=devDependencies
  [downloads]: https://img.shields.io/npm/dm/stream-combiner2-withopts.svg?style=flat-square
  [npm]: https://www.npmjs.org/package/stream-combiner2-withopts
  [npm-stats]: https://nodei.co/npm/stream-combiner2-withopts.png?downloads=true&downloadRank=true&stars=true
