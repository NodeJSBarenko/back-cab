'use strict'

const assert = require('assert-plus')
const _ = require('lodash')
const FunctionalError = require('lib/functional-error')

let cache = {}
let autoIncKey = 0

class DB {
	update(driverId, data, cb){
		assert.ok(driverId, 'driverId')
		assert.object(data, 'data')
		assert.number(data.latitude, 'data.latitude')
		assert.number(data.longitude, 'data.longitude')
		assert.bool(data.driverAvailable, 'data.driverAvailable')
		assert.func(cb, 'callback')

		if(cache[driverId]){
			cache[driverId] = _.defaults({
				latitude: data.latitude,
				longitude: data.longitude,
				driverAvailable: data.driverAvailable
			}, cache[driverId])	
			return cb()
		}
		cb(new FunctionalError('Record not found'))
	}

	create(data, cb){
		assert.object(data, 'data')
		assert.string(data.name, 'data.name')
		assert.string(data.carPlate, 'data.carPlate')
		assert.func(cb, 'callback')

		let key = ++autoIncKey
		cache[key] = {driverId:key, name:data.name, carPlate: data.carPlate}
		cb()
	}

	getByCarPlate(carPlate, cb){
		cb(null, _.findWhere(_.values(cache), {carPlate: carPlate}))
	}

	getById(driverId, cb){
		cb(null, cache[driverId])
	}

	findAvailablesInArea(data, cb){
		assert.object(data, 'queryParams sw and ne must be setted')
		assert.string(data.sw, 'sw')
		assert.string(data.ne, 'ne')
		assert.ok(data.sw.match(/-?(\d+)(\.\d+)?,-?(\d+)(\.\d+)?/), 'sw must be a tuple of numbers. Ex: 12.34,-56.78')
		assert.ok(data.ne.match(/-?(\d+)(\.\d+)?,-?(\d+)(\.\d+)?/), 'ne must be a tuple of numbers. Ex: 12.34,-56.78')
		assert.func(cb, 'callback')

		let dotSw = data.sw.split(',')
		let dotNe = data.ne.split(',')

		let matches = _.filter(_.values(cache), driver => {
			return driver.driverAvailable 
				&& driver.latitude >= dotSw[0]
				&& driver.latitude <= dotNe[0]
				&& driver.longitude >= dotSw[1]
				&& driver.longitude <= dotNe[1]
		})
		cb(null, matches)
	}
}


module.exports = {
	Db: new DB()
}