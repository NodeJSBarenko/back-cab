'use strict'

class FunctionalError extends Error {
	constructor(msg){
		super(msg)
		this.name = this.constructor.name
		Error.captureStackTrace(this, this.constructor.name)
	}
}

module.exports = FunctionalError