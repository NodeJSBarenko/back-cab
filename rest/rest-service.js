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
			actionFunc.call(this, req.params, (err, value) => {
				if(err) return this.errorHandler(action, res, err, req.params)

				this.log.debug({action: action, data: value, status: 'done'})

				res.send(value || 200)
				return next()
			})
		}
	}

	errorHandler(action, res, err, json){
			this.log.error(err, {action: action, data: json, status: err.message})
			res.send(err)
			return next()
	}

}

module.exports = RestService