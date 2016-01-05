// https://devcenter.heroku.com/articles/heroku-postgresql#connecting-in-node-js
'use strict'

const assert = require('assert-plus')
const FunctionalError = require('lib/functional-error')
const pg = require('pg')
const config = require('config').db
const log = require('lib/log').child('Db')

class Db {
	constructor(config){
		assert.object(config, 'config')
		assert.optionalString(config.databaseUrl, 'config.databaseUrl')
		this.config = config
		this.databaseUrl = process.env.DATABASE_URL || config.databaseUrl
	}

	connect(cb){
		pg.connect(this.databaseUrl, cb)
	}
}

function result(cb){
	return (err, res) => {
		if(res) 
			log.debug({command: res.command, rowCount: res.rowCount})
		return cb(err, res)
	}
}

class Drivers {
	constructor(db){
		this.db = db
	}

	update(driverId, data, cb){
		assert.ok(driverId, 'driverId')
		assert.object(data, 'data')
		assert.number(data.latitude, 'data.latitude')
		assert.number(data.longitude, 'data.longitude')
		assert.bool(data.driverAvailable, 'data.driverAvailable')
		assert.func(cb, 'callback')

		this.db.connect((err, client) => {
			if(err) return cb(err)
			client.query(
				`	UPDATE ONLY driver 
					SET latitude=($1)::double precision, 
						longitude=($2)::double precision, 
						driverAvailable=($3)::boolean 
					WHERE driverId=($4)::int
				`, 
				[data.latitude, data.longitude, data.driverAvailable, driverId]
				, result((err, res) => {
					if(res.rowCount === 0) return cb(new FunctionalError('No record found'))
					return cb(err)
				}))
		})
	}

	create(data, cb){
		assert.object(data, 'data')
		assert.string(data.name, 'data.name')
		assert.string(data.carPlate, 'data.carPlate')
		assert.func(cb, 'callback')

		this.db.connect((err, client) => {
			if(err) return cb(err)
			client.query(
				`	INSERT INTO driver
					(name, carPlate)
					VALUES 
					($1, $2)
				`,
				[data.name, data.carPlate]
				, result((err, res) => {
					return cb(err)
				}))
		})
	}

	getByCarPlate(carPlate, cb){
		this.find('carPlate', 'char', carPlate, (err, rows) => cb(err, rows && rows[0]))
	}

	getById(driverId, cb){
		this.find('driverId', 'int', driverId, (err, rows) => cb(err, rows && rows[0]))
	}

	find(field, type, value, cb){
		assert.ok(value, field)
		assert.func(cb, 'callback')

		this.db.connect((err, client) => {
			if(err) return cb(err)
			client.query(
				`	SELECT driverId as "driverId", latitude, longitude, driverAvailable as "driverAvailable" 
					FROM driver 
					where ${field} = ($1)::${type}
				`, 
				[value]
				, result( (err, res) => cb(err, res && res.rows) ))
		})
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

		this.db.connect((err, client)=>{
			if(err) return cb(err)
			client.query(
				`	SELECT driverId as "driverId", latitude, longitude, driverAvailable as "driverAvailable" 
					FROM driver 
					where driverAvailable 
						and latitude >= ($1)::double precision 
						and latitude <= ($3)::double precision 
						and longitude >=($2)::double precision 
						and longitude <=($4)::double precision
				`, 
				[dotSw[0], dotSw[1], dotNe[0], dotNe[1]]
				, result( (err, res) => cb(err, res && res.rows) ))
		})
	}
}

const db = new Db(config)
module.exports = {
	db: db,
	drivers: new Drivers(db)
}