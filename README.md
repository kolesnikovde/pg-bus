# pg-bus

Simple multiplexed PubSub on top of PostgreSQL LISTEN/NOTIFY.

### Installation

    $ npm i pg-bus

### Usage

```js
var pg  = require('pg');
var bus = require('pg-bus');

var url = 'postgres://localhost/postgres';

pg.connect(url, function(err, db) {
  if (err) throw err;

  var messages = bus(db, 'messages');

  messages.listen('message', function(data) {
    console.log(data);
    // { foo: 'bar' }
  });

  messages.notify('message', { foo: 'bar' });
});
```

### License

MIT
