'use strict'

const assert = require('assert-plus')


class RestService {
	constructor(log, server){
		log.debug({status: 'loading'})
		assert.object(log, 'log')
		assert.object(server, 'server')

		this.log = log

		this.loadDependences(server)

		log.debug({status: 'loaded'})		
	}

	restWrapper(action, actionFunc){
		return (req, res, next) => {
			try {
				actionFunc.call(this, req.params, (err, value) => {
					if(err) return this.errorHandler(action, res, err, req.params)

					this.log.debug({action: action, data: value, status: 'done'})

					res.send(value || 200)
					return next()
				})
			} catch(e) {
				this.errorHandler(action, res, e, req.params)
			}
		}
	}

	errorHandler(action, res, err, json){
			this.log.error(err, {action: action, data: json, status: err.message})
			let isAssertionFailure = err.name === 'AssertionError' || err.name === 'FunctionalError'
			res.send(isAssertionFailure ? 400:500, err)
	}

}

module.exports = RestService