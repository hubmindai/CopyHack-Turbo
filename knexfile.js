//
//
// Imports
// ############################################
require('dotenv').config()

// added code lines
const knex = require("knex");
const parse = require("pg-connection-string").parse;

// Parse the environment variable into an object containing User, Password, Host, Port etc at separate key-value pairs
const pgconfig = parse(process.env.DATABASE_URL);

// Add SSL setting to default environment variable on a new key-value pair (the value itself is an object)
pgconfig.ssl = { rejectUnauthorized: false };

const db = knex({
  client: "pg",
  connection: pgconfig,
});

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
      database: process.env.DB_DEV_DATABASE
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
      database: process.env.DB_PROD_DATABASE
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
