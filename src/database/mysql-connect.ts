import { log } from 'console';
import mysql from 'mysql2/promise'

const database = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '', // Not yet setup properly
  database: 'test'
}

// Create the connection to database
const connection = await mysql.createConnection(database)
// A simple SELECT query
try {
  const table = 'users'
  const [results, fields] = await connection.query(
    `SELECT * FROM ${table}`
  );

  console.log(results); // results contains rows returned by server
  console.log(fields); // fields contains extra meta data about results, if available
} catch (err) {
  console.log(err);
}
