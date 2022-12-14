//
//
// Imports
// ############################################
require('dotenv').config()

//
//
// Main
// ############################################
module.exports = {

  development: {
    client: 'pg',
    version: '13',
    connection: {
      host: process.env.DB_DEV_HOST,
      user: process.env.DB_DEV_USER,
      password: process.env.DB_DEV_PASSWORD,
      database: process.env.DB_DEV_DATABASE,
      ssl: true,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'migration'
    },
    seeds: {
      directory: './database/seeds'
    }
  },

  production: {
    client: 'pg',
    version: '13',
    connection: {
      host: process.env.DB_PROD_HOST,
      user: process.env.DB_PROD_USER,
      password: process.env.DB_PROD_PASSWORD,
      database: process.env.DB_PROD_DATABASE,
      ssl: true,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './database/migrations',
      tableName: 'migration'
    },
    seeds: {
      directory: './database/seeds'
    }
  }

}
