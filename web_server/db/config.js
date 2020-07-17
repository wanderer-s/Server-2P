/* eslint-disable */
const mysql = require('mysql');
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

module.exports = {
	development: {
		username: 'root',
		password: process.env.DATABASE_DEV_PASSWORD,
		database: '2p4p',
		host: 'localhost',
	},
	production: {
		username: process.env.DATABASE_PRODUCTION_USER,
		password: process.env.DATABASE_PRODUCTION_PASSWORD,
		database: '2p4p',
		host: process.env.DATABASE_PRODUCTION_HOST
	}
}