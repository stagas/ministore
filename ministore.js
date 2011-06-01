//
// ministore
// by stagas
//
// mit licenced
//

var path = require('path')
  , fs = require('fs')

function Store(data, datafile) {
  this._data = data
  this._datafile = datafile
  this._list = []
}

Store.prototype.get = function(key, cb) {
  if (null == key) return cb && cb(new Error('Need a key to get'))
  if (this.has(key)) {
    cb && cb(null, this._data[key])
    return this._data[key]
  } else {
    return cb && cb(new Error('Key "' + key + '" not found'))
  }
}

Store.prototype.set = function(key, val, cb) {
  if (null == key) return cb && cb(new Error('Need a key to set'))
  this._data[key] = val
  return this.save(cb)
}

Store.prototype.remove = function(key, cb) {
  delete this._data[key]
  return this.save(cb)
}

Store.prototype.has = function(key, cb) {
  var exists = this._data.propertyIsEnumerable(key)
  return cb
    ? cb(null, exists)
    : exists
}

Store.prototype.all = function(cb) {
  return cb
    ? cb(null, this._data)
    : this._data
}

Store.prototype.clear = function(cb) {
  this._data = {}
  return this.save(cb)
}

Store.prototype.save = function(cb) {
  this.list()
  var s = JSON.stringify(this._data, null, '  ')
  return cb
    ? fs.writeFile(this._datafile, s, 'utf8', cb)
    : fs.writeFileSync(this._datafile, s, 'utf8')
}

Store.prototype.list = function(cb) {
  this._list = Object.keys(this._data).sort()
  return cb
    ? cb(null, this._list)
    : this._list
}

Store.prototype.length = function(cb) {
  var length = this._list.length
  return cb
    ? cb(null, length)
    : length
}

Store.prototype.forEach = function(fn) {
  var result
  this._list.forEach(function(key) {
    fn.call(result, key, result)
  })
}

module.exports = function Base(base) {
  // create base dir
  base = path.normalize(base)
  if (!path.existsSync(base)) fs.mkdirSync(base, 0755)

  return function(name) {
    // prevent directory changes
    name = name.replace(/(\.\.)+|\/+/gim, '')

    // read datafile
    var data, datafile = path.normalize(path.join(base, name))
    try {
      data = JSON.parse(fs.readFileSync(datafile, 'utf8'))
    } catch(e) {
      data = {}
    }

    return new Store(data, datafile)
  }
}