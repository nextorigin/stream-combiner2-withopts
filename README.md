# stream-combiner2-withopts

This is an extension of [stream-combiner2](https://npmjs.org/package/stream-combiner2), which is a sequel to
[stream-combiner](https://npmjs.org/package/stream-combiner)
for streams3.  This extension takes any options and passes them along to the stream constructors.

``` js
var Combine = require('stream-combiner2-withopts')
```

## Combine (stream1,...,streamN, opts)

Turn a pipeline into a single stream. `Combine` returns a stream that writes to the first stream
and reads from the last stream. 

Streams1 streams are automatically upgraded to be streams3 streams.

Listening for 'error' will recieve errors from all streams inside the pipe.

'opts' is an optional options object that will be passed to the stream constructors.

```js
var Combine = require('stream-combiner2-withopts')
var es      = require('event-stream')

Combine(                                  // connect streams together with `pipe`
  process.openStdin(),                    // open stdin
  es.split(),                             // split stream to break on newlines
  es.map(function (data, callback) {      // turn this async function into a stream
    var repr = inspect(JSON.parse(data))  // render it nicely
    callback(null, repr)
  }),
  process.stdout                          // pipe it to stdout !
)
```

## License

MIT
