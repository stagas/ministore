ministore
=========

Installation:
-------------
    npm install ministore

Usage:
------
```javascript

// create our db
var Store = require('ministore')('../path/to/db/dir')

// create some collections
var users = Store('users')
var sessions = Store('sessions')

// sync way (no callback)
users.set('john', 'doe')
users.get('john') // 'doe'

// async way
users.set('mary', 'loo', function(err) {
  users.get('mary', function(err, data) {
    console.log(data) // 'loo'
  })
})

```

API methods:
------------

All API methods accept a callback as the last argument, making the process async

### get(key)
### set(key, val)
### remove(key)
### has(key)
### all()
### clear()
### list()
### length()
### forEach(fn)
### save()