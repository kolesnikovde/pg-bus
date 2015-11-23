var pg     = require('pg');
var assert = require('assert');
var bus    = require('./');

describe('pg-bus', function() {
  var url = process.env.DB || 'postgres://localhost/postgres',
      db;

  beforeEach(function(done) {
    pg.connect(url, function(err, conn) {
      if (err) throw err;

      db = conn;
      done();
    });
  });

  it('sends and receives notifications from channel', function(done) {
    var chan = bus(db, '0');

    chan.listen('data', function(data) {
      assert.deepEqual(data, { foo: "'; die; --" });
      done();
    });

    chan.notify('data', { foo: "'; die; --" });
  });

  it('listen only specified channel', function(done) {
    var chan = bus(db, '0');

    chan.listen('data', function(data) {
      assert.deepEqual(data, { foo: 'baz' });
      done();
    });

    chan.name = '1';
    chan.notify('data', { foo: 'bar' });

    chan.name = '0';
    chan.notify('data', { foo: 'baz' });
  });
});
