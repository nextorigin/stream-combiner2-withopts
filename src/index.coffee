{PassThrough} = require "readable-stream"
{Readable}    = require "readable-stream"
duplexer      = require "duplexer2"


wrap = (tr, opts) ->
  return tr if typeof tr.read is "function"
  (new Readable opts).wrap tr

recurse = (streams) ->
  return if streams.length < 2
  streams[0].pipe streams[1]
  recurse streams[1..]

Combine = (streams..., opts) ->
  streams = streams[0] if Array.isArray streams[0]
  if opts?.write or opts?.read
    streams.push opts
    opts = {}
  streams = (wrap stream, opts for stream in streams)
  return new PassThrough opts unless streams.length
  return streams[0] if streams.length is 1

  first   = streams[0]
  last    = streams[-1..][0]
  thepipe = duplexer opts, first, last
  recurse streams

  #es.duplex already reemits the error from the first and last stream.
  #add a listener for the inner streams in the pipeline.
  onerror = (args...) ->
    args.unshift "error"
    thepipe.emit args...
  stream.on "error", onerror for stream in streams[1...-1]
  thepipe


module.exports = Combine
