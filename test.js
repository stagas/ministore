//

var assert = require('assert')
  , Store = require('./ministore')('mdb')

var users = Store('users')
var sessions = Store('sessions')

users.clear()
sessions.clear()

users.set('john', 'doe')
assert.equal(users.get('john'), 'doe')

assert.equal(users.length(), 1)
users.length(function(err, length) {
  assert.equal(err, null)
  assert.equal(length, 1)
})

users.set('mary', 'loo', function(err) {
  assert.equal(err, null)
  users.get('mary', function(err, data) {
    assert.equal(data, 'loo')

    assert.deepEqual(users.all(), { 'john': 'doe', 'mary': 'loo' })
    users.all(function(err, data) {
      assert.equal(err, null)
      assert.deepEqual(data, { 'john': 'doe', 'mary': 'loo' })

      users.remove('john')
      assert.equal(users.get('john'), null)
      users.remove('mary', function(err) {
        assert.equal(err, null)
        users.get('mary', function(err, data) {
          assert.notEqual(err, null)
          assert.equal(data, null)
        })
      })
    })
  })
})

sessions.set('foo', { foo: 'bar' })
sessions.set('bar', { bar: 'foo' })

sessions.forEach(function(key) {
  assert.deepEqual(this, sessions.get(key))
})

assert.equal(sessions.length(), 2)
assert.deepEqual(sessions.list(), [ 'bar', 'foo' ])

