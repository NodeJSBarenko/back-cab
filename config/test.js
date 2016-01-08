'use strict'

module.exports = {
	bunyan: {
		name: "[TEST] BackCab",
		streams: [
			{
				level: 'error',
				stream: 'stderr'
			}
		]
	},
	db: {
		module: 'memory',
		databaseUrl: 'localhost'
	},
	server: {
		name: 'back-cab',
		version: '1.0.0',
		port: 8080,
		address: null,
		auth: {
			username: 'admin',
			password: 'admin'
		}
	}
}