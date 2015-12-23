'use strict'

const db = require('lib/persistence/db').Db
const assert = require('assert-plus')
const log = require('lib/log').child('CabDriverRest')
const RestService = require('./rest-service')

class CabDriverRest extends RestService {
	constructor(server){
		super(log, server)
	}

	loadDependences(server){
		// curl -iH "Content-Type: application/json" -X POST -d '{"name":"Pedro","carPlate":"RPC-9999"}' http://admin:admin@[::]:8080/drivers
		server.post('/drivers', this.restWrapper('create', this.create))
		// curl -H "Content-Type: application/json" http://admin:admin@[::]:8080/drivers/RPC-9999
		// curl -H "Content-Type: application/json" http://admin:admin@[::]:8080/drivers/
		server.get('/drivers/:carPlate', this.restWrapper('get', this.get))

		// curl -iH "Content-Type: application/json" -X POST -d {"latitude":-23.60810717,"longitude":-46.67500346,"driverId":5997,"driverAvailable":true}' http://admin:admin@[::]:8080/drivers/8475/status
		console.log('IMPLEMENTAR')

		// curl -iH "Content-Type: application/json" -d {"latitude":-23.60810717,"longitude":-46.67500346,"driverId":5997,"driverAvailable":true}' http://admin:admin@[::]:8080/drivers/inArea?sw=-23.612474,-46.702746&ne=-23.589548,-46.673392
/*		[
			{"latitude":-23.60810717,"longitude":-46.67500346,"driverId":5997,"driverAvailable":true},
			{"latitude":-23.59065045044675,"longitude":-46.68837101634931,"driverId":63446,"driverAvailable":true},
			{"latitude":-23.60925506,"longitude":-46.69390415,"driverId":1982,"driverAvailable":true},
			{"latitude":-23.599871666666665,"longitude":-46.680903333333326,"driverId":9106,"driverAvailable":true},
			{"latitude":-23.59492613,"longitude":-46.69024011,"driverId":16434,"driverAvailable":true}
		]*/

		// curl -iH "Content-Type: application/json" -d {"latitude":-23.60810717,"longitude":-46.67500346,"driverId":5997,"driverAvailable":true}' http://admin:admin@[::]:8080/drivers/73456/status
		// '{"latitude":-23.60810717,"longitude":-46.67500346,"driverId":5997,"driverAvailable":true}'

	}

	create(cabDriver, cb){
		try{
			assert.string(cabDriver.name, 'name')
			assert.string(cabDriver.carPlate, 'carPlate')
			assert.ok(cabDriver.carPlate.match(/[A-Z]{3}-\d{4}/), 'Car plate must have the pattern: AAA-####')
		} catch(err){
			return cb(err)
		}

		let data = {name: cabDriver.name, carPlate: cabDriver.carPlate}
		db.insert('driver', data, cb)
	}

	updateState(cabDriver, next){

	}

	get(params, cb){
		try{
			assert.string(params.carPlate, 'params.carPlate')
		} catch(err){
			return cb(err)
		}

		let plate = params.carPlate
		if(plate){
			db.get('driver', plate, cb)
		} else {
			db.find('driver', null, cb)
		}
	}
}

module.exports = CabDriverRest
