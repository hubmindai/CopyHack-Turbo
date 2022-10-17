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
      host: 'db-postgresql-nyc1-do-user-10528061-0.b.db.ondigitalocean.com',
      port: '25060',
      user: 'doadmin',
      password: 'AVNS_hFsDkFF_E0fLQ-Rfx3-',
      database: 'dbdev',
}
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
      host: 'db-postgresql-nyc1-do-user-10528061-0.b.db.ondigitalocean.com',
      user: 'doadmin',
      password: 'AVNS_hFsDkFF_E0fLQ-Rfx3-',
      database: 'dbprod',
}
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
