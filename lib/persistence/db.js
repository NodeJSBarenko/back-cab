const config = require('config').db

module.exports = require(`lib/persistence/${config.module}`)

