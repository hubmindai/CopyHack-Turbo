//
//
// Imports
// ############################################
require('dotenv').config()

// Added
console.dir(process.env);

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
      port: process.env.DB_PORT,
      user: process.env.DB_DEV_USER,
      password: process.env.DB_DEV_PASSWORD,
      database: process.env.DB_DEV_DATABASE,
      ssl: {
      ca: fs.readFileSync(path.join(__dirname, '../ca-certificate.crt'))
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
      host: process.env.DB_PROD_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_PROD_USER,
      password: process.env.DB_PROD_PASSWORD,
      database: process.env.DB_PROD_DATABASE,
      ssl: {
      ca: fs.readFileSync(path.join(__dirname, '../ca-certificate.crt'))
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
