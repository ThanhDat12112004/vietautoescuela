const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({
  path: process.env.ENV_FILE || path.resolve(__dirname, '../../../../.env'),
});

const DB_HOST = process.env.MYSQL_HOST;
const DB_PORT = process.env.MYSQL_PORT;
const DB_USER = process.env.MYSQL_USER || 'root';
const DB_NAME = process.env.MYSQL_DATABASE;
const ALLOW_EMPTY_PASSWORD = String(process.env.MYSQL_ALLOW_EMPTY_PASSWORD || '').toLowerCase() === 'true';
const DB_PASSWORD = process.env.MYSQL_PASSWORD;

if (!DB_HOST || !DB_PORT || !DB_USER || !DB_NAME || (!DB_PASSWORD && !ALLOW_EMPTY_PASSWORD)) {
  throw new Error('Missing MySQL environment variables');
}

module.exports = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  connectionLimit: 10,
  namedPlaceholders: true,
});
