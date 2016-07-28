// Generated by CoffeeScript 1.10.0
var Combine, PassThrough, Readable, duplexer, recurse, wrap,
  slice = [].slice;

PassThrough = require("readable-stream").PassThrough;

Readable = require("readable-stream").Readable;

duplexer = require("duplexer2");

wrap = function(tr, opts) {
  if (typeof tr.read === "function") {
    return tr;
  }
  return (new Readable(opts)).wrap(tr);
};

recurse = function(streams) {
  if (streams.length < 2) {
    return;
  }
  streams[0].pipe(streams[1]);
  return recurse(streams.slice(1));
};

Combine = function() {
  var first, i, j, last, len, onerror, opts, ref, stream, streams, thepipe;
  streams = 2 <= arguments.length ? slice.call(arguments, 0, i = arguments.length - 1) : (i = 0, []), opts = arguments[i++];
  if (Array.isArray(streams[0])) {
    streams = streams[0];
  }
  if ((opts != null ? opts.write : void 0) || (opts != null ? opts.read : void 0)) {
    streams.push(opts);
    opts = {};
  }
  streams = (function() {
    var j, len, results;
    results = [];
    for (j = 0, len = streams.length; j < len; j++) {
      stream = streams[j];
      results.push(wrap(stream, opts));
    }
    return results;
  })();
  if (!streams.length) {
    return new PassThrough(opts);
  }
  if (streams.length === 1) {
    return streams[0];
  }
  first = streams[0];
  last = streams.slice(-1)[0];
  thepipe = duplexer(opts, first, last);
  recurse(streams);
  onerror = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    args.unshift("error");
    return thepipe.emit.apply(thepipe, args);
  };
  ref = streams.slice(1, -1);
  for (j = 0, len = ref.length; j < len; j++) {
    stream = ref[j];
    stream.on("error", onerror);
  }
  return thepipe;
};

module.exports = Combine;

//# sourceMappingURL=index.js.map
