'use strict'

const restify = require('restify')
const assert = require('assert-plus')
const _ = require('lodash')
const log = require('lib/log').child('BackCabServer')
const CabDriverRest = require('./cab-driver-rest')


class BackCabServer {
	constructor(config){
		log.debug({status: 'loading'})

		assert.object(config, 'config')
		assert.string(config.name, 'config.name')
		assert.string(config.version, 'config.version')
		assert.number(config.port, 'config.port')

		this.config = config
		this.config.log = log

		this.server = restify.createServer(this.config)

		if(this.config.auth && this.config.auth.username){
			this.authentication()
		}

		this.server.use(restify.CORS())
		this.server.use(restify.acceptParser(this.server.acceptable))
		this.server.use(restify.queryParser())
		this.server.use(restify.bodyParser())

		this.loadDependences()
		this.listeners()

		//this.server.get('/echo/:name', (rq,rs,nx) => {rs.send(rq.params);nx()})
		log.debug({status: 'loaded'})
	}

	loadDependences(){
		new CabDriverRest(this.server)
	}

	listeners(){
		this.server.on('InternalServer', (req, res, err, cb) => {
			log.error(err)
			err.body = 'something is wrong!'
			return cb()
		})

		this.server.on('uncaughtException', (req, res, route, err) => {
			log.error(err)
			return res.send(err)
		})
	}

	authentication(){
		assert.string(this.config.auth.username, 'config.auth.username')
		assert.string(this.config.auth.password, 'config.auth.password')

		this.server.use(restify.authorizationParser())

		this.server.use((req, res, next) => {
			if(req.username === this.config.auth.username && req.authorization.basic.password === this.config.auth.password)
				return next()
			else {
				res.header('WWW-Authenticate','Basic')
				res.send(401)
				return next(new restify.NotAuthorizedError('Username or password is wrong'))
			}
		})
	}

	start(){
		log.info({serverName: this.server.name, status: 'starting'})
		this.server.listen(this.config.port, this.config.address, () => log.info({serverName: this.server.name, serverUrl: this.server.url, status: 'started'}))
	}


}

module.exports = BackCabServer
