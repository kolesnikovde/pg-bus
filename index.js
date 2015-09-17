'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports = function(client, channelName) {
  var channel = new Channel(client, channelName);
  channel.open();

  return channel;
}

var MAX_PAYLOAD_SIZE = 8192;

function Channel(client, name) {
  this.client = client;
  this.name = name;
  this.listening = true;
  EventEmitter.call(this);
}

util.inherits(Channel, EventEmitter);

var proto = Channel.prototype;

proto.open = function() {
  if (this.listening) return;
  this.listening = true;

  this.client.query('LISTEN ' + this.name);
  this.client.on('notification', this.onNotification.bind(this));
}

proto.close = function() {
  if (this.listening) {
    this.listening = false;
    this.client.query('UNLISTEN ' + this.name);
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

  this.query('SELECT pg_notify(' + this.name + ', $1)', [payload]);
}
