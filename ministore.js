//
// ministore
// by stagas
//
// mit licenced
//

var path = require('path')
  , fs = require('fs')

function Store(name, data, datafile, options) {
  this._name = name
  this._options = options
  this._data = data
  this._datafile = datafile
  this._list = []
  this._changes = 0
  
  if (this._options.polling) {
    var self = this
    setInterval(function() {
      self.save(function(err) {}, true)
    }, 'number' === typeof this._options.polling
      ? this._options.polling
      : 1000
    )
  }
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
  this._data[key] = 'function' === typeof val ? val.toString() : val
  this._changes++
  return this.save(cb)
}

;[ 'push', 'unshift' ].forEach(function(method) {
  Store.prototype[method] = function(key, val, cb) {
    if (null == key) return cb && cb(new Error('Need a key to ' + method))
    if (!this.has(key)) this._data[key] = []
    this._data[key][method]('function' === typeof val ? val.toString() : val)
    this._changes++
    return this.save(cb)
  }
})

;[ 'shift', 'pop' ].forEach(function(method) {
  Store.prototype[method] = function(key, cb) {
    if (null == key) return cb && cb(new Error('Need a key to ' + method))
    if (!this.has(key)) this._data[key] = []
    var element = this._data[key][method]()
    this._changes++
    if (cb) {
      this.save(function(err) {
        if (err) cb && cb(err)
        cb && cb(null, element)
      })
    } else {
      this.save()
      return element
    }
  }
})

;[ 'evalshift', 'evalpop' ].forEach(function(method) {
  Store.prototype[method] = function(key, cb) {
    if (null == key) return cb && cb(new Error('Need a key to ' + method))
    if (!this.has(key)) this._data[key] = []
    var element = eval('(' + this._data[key][method.substr(4)]() + ')')
    this._changes++
    if (cb) {
      this.save(function(err) {
        if (err) cb && cb(err)
        cb && cb(null, element)
      })
    } else {
      this.save()
      return element
    }
  }
})

Store.prototype.remove = function(key, cb) {
  delete this._data[key]
  this._changes++
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
  this._changes++
  return this.save(cb)
}

Store.prototype.save = function(cb, force) {
  this.list()
  if (!force && this._options.polling) return cb && cb(null)
  if (!this._changes) return cb && cb(new Error('Nothing to save ' + this._name))
  this._changes = 0
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
  var self = this, result
  this._list.forEach(function(key) {
    result = self.get(key)
    fn.call(result, key, result)
  })
}

Store.prototype.eval = function(key) {
  return eval('(' + this.get(key) + ')')
}

module.exports = function Base(base, baseOptions) {
  // defaults
  var options = {
    polling: false
  }

  // overwrite defaults
  for (var k in baseOptions) {
    options[k] = baseOptions[k]
  }

  // create base dir
  base = path.normalize(base)
  if (!fs.existsSync(base)) fs.mkdirSync(base, 0755)

  return function(name, storeOptions) {
    storeOptions = storeOptions || {}
    for (var k in options) {
      if ('undefined' === typeof storeOptions[k]) {
        storeOptions[k] = options[k]
      }
    }

    // prevent directory changes
    name = name.replace(/(\.\.)+|\/+/gim, '')

    // read datafile
    var data, datafile = path.normalize(path.join(base, name))
    try {
      data = JSON.parse(fs.readFileSync(datafile, 'utf8'))
    } catch(e) {
      data = {}
    }

    return new Store(name, data, datafile, storeOptions)
  }
}