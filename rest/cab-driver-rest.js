'use strict'

const drivers = require('lib/persistence/db').drivers
const assert = require('assert-plus')
const log = require('lib/log').child('CabDriverRest')
const RestService = require('./rest-service')

class CabDriverRest extends RestService {
	constructor(server){
		super(log, server)
	}

	loadDependences(server){
		// curl -iH "Content-Type: application/json" -X POST -d '{"name":"Pedro","carPlate":"RPC9999"}' http://admin:admin@[::]:8080/drivers
		server.post('/drivers', this.restWrapper('create', this.create))

		// curl -iH "Content-Type: application/json" -X POST -d '{"latitude":-23.60810717,"longitude":-46.67500346,"driverId":5997,"driverAvailable":true}' http://admin:admin@[::]:8080/drivers/8475/status
		server.post('/drivers/:driverId/status', this.restWrapper('updateStatus', this.updateStatus))

		// curl -iH "Content-Type: application/json" http://admin:admin@[::]:8080/drivers/inArea?sw=-23.612474,-46.702746&ne=-23.589548,-46.673392
		server.get('/drivers/inArea', this.restWrapper('inArea', this.inArea))

		// curl -iH "Content-Type: application/json"  http://admin:admin@[::]:8080/drivers/8475/status
		server.get('/drivers/:driverId/status', this.restWrapper('getStatus', this.getStatus))

		// curl -iH "Content-Type: application/json"  http://admin:admin@[::]:8080/drivers/carPlate/asd0000/status
		server.get('/drivers/carPlate/:carPlate/status', this.restWrapper('getStatusByCarPlate', this.getStatusByCarPlate))
	}

	create(params, next){
		drivers.create(params, next)
	}

	updateStatus(params, next){
		drivers.update(params.driverId, params, next)
	}

	inArea(params, next){
		drivers.findAvailablesInArea(params, next)
	}

	getStatus(params, next){
		drivers.getById(params.driverId, next)
	}

	getStatusByCarPlate(params, next){
		drivers.getByCarPlate(params.carPlate, next)
	}
}

module.exports = CabDriverRest
