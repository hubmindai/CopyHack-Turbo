'use strict'

//
//
// Imports
// ############################################
const knex = require('knex')
const knexConfig = require('../knexfile')

//
//
// Setup
// ############################################
const knexInstance = knex(knexConfig[process.env.DB_ENVIRONMENT])

//
//
// Methods
// ############################################
exports.instance = knexInstance
