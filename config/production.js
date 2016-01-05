'use strict'

module.exports = {
	bunyan: {
		name: "[PROD] BackCab",
		streams: [
			{
				level: 'info',
				stream: 'stdout'
			}
		]
	},
	db:{
		databaseUrl: process.env.DATABASE_URL
	},
	server: {
		name: 'back-cab',
		version: '1.0.0',
		port: parseInt(process.env.PORT || 8080),
		address: null,
		auth: {
			username: 'admin',
			password: 'admin'
		}
	}
}