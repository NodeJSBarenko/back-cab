'use strict'

const assert = require('assert-plus')
const _ = require('lodash')

let cache = {}
let autoIncKey = 0

class DB {
	save(collection, key, data, cb){
		assert.string(collection, 'collection')
		assert.ok(key, 'key')
		assert.ok(data, 'data')
		assert.func(cb, 'callback')

		cache[collection] = cache[collection] || {}
		cache[collection][key] = data
		cb()
	}

	insert(collection, data, cb){
		assert.string(collection, 'collection')
		assert.ok(data, 'data')
		assert.func(cb, 'callback')

		cache[collection] = cache[collection] || {}
		cache[collection][++autoIncKey] = data
		cb(null, autoIncKey)
	}

	get(collection, key, cb){
		assert.string(collection, 'collection')
		assert.ok(key, 'key')
		assert.func(cb, 'callback')

		let coll = cache[collection]
		if(!coll) return cb(new Error(`'${collection}' collection not exists`))

		cb(null, coll[key])
	}

	find(collection, query, cb){
		assert.string(collection, 'collection')
		assert.func(cb, 'callback')

		let coll = cache[collection]
		if(!coll) return cb(new Error(`'${collection}' collection not exists`))

		cb(null, _.where(coll, query))
	}
}


module.exports = {
	Db: new DB()
}