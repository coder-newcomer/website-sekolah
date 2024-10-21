// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server"
import mysql from 'mysql2/promise'

let output

const database = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '', // Not yet setup properly
  database: 'test',
}

// Create the connection to database
const connection = await mysql.createConnection(database)
// A simple SELECT query
try {
  const table = 'users'
  const [results, fields] = await connection.query(`SELECT * FROM ${table}`)

  console.log(results) // results contains rows returned by server
  output = results
  console.log(fields) // fields contains extra meta data about results, if available
} catch (err) {
  console.log(err)
}

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
          <script>alert({output})</script>
        </body>
      </html>
    )}
  />
));