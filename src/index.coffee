{PassThrough} = require "readable-stream"
{Readable}    = require "readable-stream"
Duplexer      = require "duplexer2-unwrappable"
{EventEmitter} = require "events"


wrap = (tr, opts) ->
  return tr if typeof tr.read is "function"
  (new Readable opts).wrap tr

recurse = (streams) ->
  return if streams.length < 2
  streams[0].pipe streams[1]
  recurse streams[1..]

unwrap = (streams) ->
  return if streams.length < 2
  streams[0].unpipe streams[1]
  unwrap streams[1..]

parseArgs = (streams, opts) ->
  streams = streams[0] if Array.isArray streams[0]
  if opts and (opts.write or opts.read or opts instanceof EventEmitter)
    streams.push opts
    opts = {}
  streams = (wrap stream, opts for stream in streams)
  {streams, opts}

Combine = (streams..., opts) ->
  {streams, opts} = parseArgs streams, opts
  return new PassThrough unless streams.length
  return streams[0] if streams.length is 1

  opts.bubbleErrors = false
  first   = streams[0]
  last    = streams[-1..][0]
  thepipe = new Duplexer opts, first, last
  recurse streams

  onerror = (args...) ->
    thepipe.emit "error", args...

  stream.on "error", onerror for stream in streams

  thepipe.unwrap = ->
    thepipe.unbind()
    stream.removeListener "error", onerror for stream in streams
    unwrap streams

  thepipe


module.exports = Combine
