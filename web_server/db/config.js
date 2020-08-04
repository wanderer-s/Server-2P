/* eslint-disable */
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const development = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.DATABASE_DEV_PASSWORD,
  database: '2p4p',
});

/* const production = mysql.createConnection({
    host: process.env.DATABASE_PRODUCTION_HOST,
    user: process.env.DATABASE_PRODUCTION_USER,
    password: process.env.DATABASE_PRODUCTION_PASSWORD,
    database: '2p4p'
  })
  poduction.connect()
   */

module.exports = development;
