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

Merge = (streams..., opts) ->
  {streams, opts} = parseArgs streams, opts
  return new PassThrough unless streams.length
  return streams[0] if streams.length is 1

  sources = []
  thepipe = new PassThrough opts

  onerror = (args...) ->
    thepipe.emit "error", args...

  add = (source) ->
    sources.push source
    source.once "end", remove.bind null, source
    source.on "error", onerror
    source.pipe thepipe, end: false

  remove = (source) ->
    source.unpipe thepipe
    sources = (s for s in sources when s isnt source)
    source.removeListener "error", onerror
    thepipe.end() unless sources.length

  add stream for stream in streams

  thepipe.unwrap = ->
    remove sources[0] while sources.length

  thepipe.add    = add
  thepipe.remove = remove
  thepipe


Combine.Merge  = Merge
module.exports = Combine
