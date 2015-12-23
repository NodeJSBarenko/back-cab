'use strict'

module.exports = {
	bunyan: {
		name: "[PROD] BackCab",
		streams: [
			{
				level: 'error',
				stream: 'stderr'
			},
			{
				level: 'info',
				stream: 'stdout'
			}
		]
	},
	server: {
		name: 'back-cab',
		version: '1.0.0',
		port: process.env.PORT || 8080,
		address: null,
		auth: {
			username: 'admin',
			password: 'admin'
		}
	}
}