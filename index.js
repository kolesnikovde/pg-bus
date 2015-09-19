'use strict';

var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var escape       = require('pg-escape');

module.exports = function(db, channelName) {
  var channel = new Channel(db, channelName);
  channel.open();

  return channel;
}

var MAX_PAYLOAD_SIZE = 8000;

function Channel(db, name) {
  this.db = db;
  this.name = name;
  this.listening = false;
  EventEmitter.call(this);
}

util.inherits(Channel, EventEmitter);

var proto = Channel.prototype;

proto.open = function() {
  if (this.listening) return;
  this.listening = true;

  this.db.query(escape('LISTEN "%s"', this.name));
  this.db.on('notification', this.onNotification.bind(this));
}

proto.close = function() {
  if (this.listening) {
    this.listening = false;
    this.db.query(escape('UNLISTEN "%s"', this.name));
  }

  this.removeAllListeners();
}

proto.onNotification = function(e) {
  var payload = JSON.parse(e.payload);

  this.emit(payload.type, payload.data);
}

// Alias for `on`.
proto.listen = function(type, fn) {
  this.on(type, fn);
}

proto.notify = function(type, data) {
  var payload = JSON.stringify({ type: type, data: data });

  if (payload.length > MAX_PAYLOAD_SIZE) {
    throw new Error('Max payload size is exceeded.');
  }

  this.db.query(escape('NOTIFY "%s", %L', this.name, payload));
}
