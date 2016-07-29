var es = require('event-stream')
var through = require('through2')
var combine = require('..')
var test = require('tape')

test('re-emit error object for old streams', function (test) {
  test.plan(1)

  var expectedErr = new Error('asplode')

  var pipe = combine(
    es.through(function(data) {
      return this.emit('error', expectedErr)
    })
  )

  pipe.on('error', function (err) {
    test.equal(err, expectedErr)
  })

  pipe.write('pow')
})

test('do not duplicate errors', function (test) {

  var errors = 0;
  var pipe = combine(
    es.through(function(data) {
      return this.emit('data', data);
    }),
    es.through(function(data) {
      return this.emit('error', new Error(data));
    })
  )

  pipe.on('error', function(err) {
    errors++
    test.ok(errors, 'expected error count')
      process.nextTick(function () {
        return test.end();
      })
  })

  return pipe.write('meh');
})

test('3 pipe do not duplicate errors', function (test) {

  var errors = 0;
  var pipe = combine(
    es.through(function(data) {
      return this.emit('data', data);
    }),
    es.through(function(data) {
      return this.emit('error', new Error(data));
    }),
    es.through()
  )

  pipe.on('error', function(err) {
    errors++
    test.ok(errors, 'expected error count')
      process.nextTick(function () {
        return test.end();
      })
  })

  return pipe.write('meh');

})

test('0 argument through stream', function (test) {
  test.plan(3)
  var pipe = combine()
   , expected = [ 'beep', 'boop', 'robots' ]

  pipe.pipe(es.through(function(data) {
    test.equal(data.toString('utf8'), expected.shift())
  }))
  pipe.write('beep')
  pipe.write('boop')
  pipe.end('robots')
})

test('object mode', function (test) {
  test.plan(2)
  var opts = {objectMode: true}
   , expected = [ [4,5,6], {x:5} ]

  pipe = combine(through.obj(function(data, enc, next) {
    test.deepEqual(data, expected.shift())
    next()
  }), opts)
  pipe.write([4,5,6])
  pipe.write({x:5})
  pipe.end()
})

test('unwrap unpipes streams', function (test) {
  test.plan(1)
  var errors = 0;
  var pipe = combine(
    es.through(),
    es.through(function(data) {
      errors++
      return test.fail("should not have piped")
    })
  )

  pipe.unwrap()
  pipe.write('meh')
  test.notOk(errors, "expected no errors")
})

test('unwrap unbinds streams', function (test) {
  test.plan(2)
  var errors = 0;
  var pipe = combine(
    es.through(function(data) {
      return this.emit("error", new Error(data))
    }),
    es.through(function(data) {
      errors++
      return test.fail("should not have piped")
    }),
    es.through()
  )

  pipe.on('error', function(err) {
    errors++
    return test.fail("should not have bubbled error")
  })

  pipe._writable.on("finish", function() {
    errors++
    return test.fail("event not unbound")
  })

  pipe.unwrap()
  pipe.emit("finish")
  try {
    pipe.write('meh')
  } catch (err) {
    test.ok(err.toString().match(/meh/), "should have unbound error handlers")
    test.notOk(errors, "expected no errors")
  }
})