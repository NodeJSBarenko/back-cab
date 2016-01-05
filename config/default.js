'use strict'

module.exports = {
	bunyan: {
		name: "[DEV] BackCab",
		streams: [
			{
				level: 'error',
				stream: 'stderr'
			},
			{
				level: 'debug',
				stream: 'stdout'
			}
		]
	},
	db: {
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