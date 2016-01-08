'use strict'
const assert = require('assert-plus')
const db = require('lib/persistence/db').drivers
const CabDriverRest = require('rest/cab-driver-rest')
const _ = require('lodash')

const serverFake = {
	post: () => {},
	get: () => {},
}

describe('CabDriverRest', function(){
	describe('#create()', function(){
		let cabDriverRest = new CabDriverRest(serverFake)
		
		it('with params', function(done){
			cabDriverRest.create({
				name: 'aaa',
				carPlate: 'ABC1234'
			}, done)
		})
	})

	describe('#updateStatus()', function(){
		let cabDriverRest = new CabDriverRest(serverFake)
		
		it('without driver', function(done){
			cabDriverRest.updateStatus({
				driverId: 123,
				latitude: -12.12345678,
				longitude: 45.12345678,
				driverAvailable: true
			}, err => {
				assert.equal(err.name, 'FunctionalError')
				assert.equal(err.message, 'Record not found')
				done()
			})
		})

		it('with driver', function(done){
			db.addCache(333, {
				driverId: 333,
				latitude: -22.22,
				longitude: 33.33,
				driverAvailable: false
			})

			cabDriverRest.updateStatus({
				driverId: 333,
				latitude: -12.12345678,
				longitude: 45.12345678,
				driverAvailable: true
			}, err => {
				let data = db.getCache()[333]
				assert.ok(data, 'data not found into database')
				assert.equal(data.driverId, 333)
				assert.equal(data.latitude, -12.12345678)
				assert.equal(data.longitude, 45.12345678)
				assert.equal(data.driverAvailable, true)
				done()
			})
		})
	})

	describe('#getStatus()', function(){
		let cabDriverRest = new CabDriverRest(serverFake)
		
		it('without driver', function(done){
			cabDriverRest.getStatus({
				driverId: 123123
			}, (err, data) => {
				assert.equal(data, null)
				assert.equal(err, null)
				done()
			})
		})

		it('with driver', function(done){
			db.addCache(333, {
				driverId: 333,
				latitude: -12.12345678,
				longitude: 45.12345678,
				driverAvailable: true
			})

			cabDriverRest.getStatus({
				driverId: 333
			}, (err, data) => {
				assert.ok(data, 'data not found into database')
				assert.equal(data.driverId, 333)
				assert.equal(data.latitude, -12.12345678)
				assert.equal(data.longitude, 45.12345678)
				assert.equal(data.driverAvailable, true)
				done()
			})
		})
	})

	describe('#getStatusByCarPlate()', function(){
		let cabDriverRest = new CabDriverRest(serverFake)
		
		it('without carPlate', function(done){
			cabDriverRest.getStatusByCarPlate({
				carPlate: 'QQQ1111'
			}, (err, data) => {
				assert.equal(data, null)
				assert.equal(err, null)
				done()
			})
		})

		it('with carPlate', function(done){
			db.addCache(333, {
				driverId: 333,
				carPlate: 'WWW1234',
				latitude: -12.12345678,
				longitude: 45.12345678,
				driverAvailable: true
			})

			cabDriverRest.getStatusByCarPlate({
				carPlate: 'WWW1234'
			}, (err, data) => {
				assert.ok(data, 'data not found into database')
				assert.equal(data.driverId, 333)
				assert.equal(data.latitude, -12.12345678)
				assert.equal(data.longitude, 45.12345678)
				assert.equal(data.driverAvailable, true)
				done()
			})
		})
	})

	describe('#inArea()', function(){
		let cabDriverRest = new CabDriverRest(serverFake)
		db.addCache(111, {
			driverId: 111,
			carPlate: 'XXX1111',
			latitude: 5.5,
			longitude: 7.8,
			driverAvailable: true
		})
		db.addCache(222, {
			driverId: 222,
			carPlate: 'YYY2222',
			latitude: 15.6,
			longitude: 7.8,
			driverAvailable: true
		})
		db.addCache(666, {
			driverId: 666,
			carPlate: 'ZZZ6666',
			latitude: 50.9,
			longitude: 8.9,
			driverAvailable: true
		})
		db.addCache(444, {
			driverId: 444,
			carPlate: 'YYY4444',
			latitude: 15.6,
			longitude: 7.8,
			driverAvailable: false
		})
		
		it('without any car', function(done){
			cabDriverRest.inArea({
				sw: '-12.4,-13.6',
				ne: '-10.8,-2.6'
			}, (err, data) => {
				assert.deepEqual(data, [])
				assert.equal(err, null)
				done()
			})
		})
		
		it('with all cars', function(done){
			cabDriverRest.inArea({
				sw: '0,0',
				ne: '15,15'
			}, (err, data) => {
				assert.ok(data)
				assert.equal(err, null)
				assert.equal(data.length, 1)
				assert.ok(_.find(data, {driverId: 111}))
				done()
			})
		})
		
		it('with subarea', function(done){
			cabDriverRest.inArea({
				sw: '0,0',
				ne: '100,100'
			}, (err, data) => {
				assert.ok(data)
				assert.equal(err, null)
				assert.equal(data.length, 3)
				assert.ok(_.find(data, {driverId: 111}))
				assert.ok(_.find(data, {driverId: 222}))
				assert.ok(_.find(data, {driverId: 666}))
				done()
			})
		})

	})
})
