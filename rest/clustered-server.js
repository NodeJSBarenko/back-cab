'use strict'

const cluster = require('cluster')
const cpus = require('os').cpus().length
const log = require('lib/log').child(`[${cluster.isMaster?'Master':'Slave'}]ClusteredServer`)
const serverConfig = require('config').server
const BackCabServer = require('./server')
const argv = require('minimist')(process.argv.slice(2), {})
const assert = require('assert-plus')


class ClusteredServer {
	constructor(options){
		options = options || argv

		this.cpus = parseInt(process.env.WEB_CONCURRENCY || options.cpus || cpus)
		this.timeout = options.timeout || 2000
		this.timeouts = {}
	}

	start(){
		if(cluster.isMaster) {
			log.info({cpus: this.cpus, status:'starting'})
			this.master()
			log.info({status:'started'})
		} else this.worker()
	}

	master(){
		for(let i=0; i<this.cpus; i++){
			cluster.fork()
		}

		cluster.on('exit', (worker, code, signal) => {
			clearTimeout(this.timeouts[worker.id])
			log.info({worker: worker.process.id, code: code, signal: signal, status: 'died'})

			cluster.fork() //restarting
		})

		cluster.on('fork', worker => {
			log.info({worker: worker.process.id, status: 'forked'})
			this.timeouts[worker.id] = setTimeout(() => log.warn({worker: worker.process.id, status:'timeout', msg: 'something wrong with the connection'}), this.timeout)
		})

		cluster.on('listening', (worker, address) => {
			clearTimeout(this.timeouts[worker.id])
			log.info({worker: worker.process.id, status: 'listening', address:`${address.address}:${address.port}`})
		})

		cluster.on('disconnect', worker => {
			clearTimeout(this.timeouts[worker.id])
			log.info({worker: worker.process.id, status: 'disconnected'})
		})
	}

	worker(){
		new BackCabServer(serverConfig).start()
	}
}

new ClusteredServer().start()