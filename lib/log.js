'use strict'

const config = require('config').bunyan

config.streams = config.streams.map(function(it){
	if(it.stream === 'stdout') it.stream = process.stdout
	if(it.stream === 'stderr') it.stream = process.stderr
	return it
})

const bunyan = require('bunyan')
const logger = bunyan.createLogger(config)

module.exports = {
	Logger: logger,
	child: childName => logger.child({module: childName})
}