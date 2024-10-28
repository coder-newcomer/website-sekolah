import mysql from 'mysql2/promise'
import connections from './connection-mysql'

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'test',
});
