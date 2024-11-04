import type { Connections } from '~/server.config'
import mysql from 'mysql2'

class Database {
  host: string
  port: number
  database: string
  user: string
  password: string
  connection: mysql.Connection

  constructor(connections: Connections) {
    this.host = connections.host
    this.port = connections.port
    this.database = connections.database
    this.user = connections.user
    this.password = connections.password

    // Create a connection to the MySQL database
    this.connection = mysql.createConnection({
      host: this.host,
      port: this.port,
      database: this.database,
      user: this.user,
      password: this.password,
    })
  }

  // You can add methods to interact with the database here
  connect() {
    this.connection.connect((err) => {
      if (err) {
        console.error('Error connecting to the database:', err)
        return
      }
      console.log('Connected to the database')
    })
  }

  // Don't forget to close the connection when done
  close() {
    this.connection.end((err) => {
      if (err) {
        console.error('Error closing the connection:', err)
      } else {
        console.log('Connection closed')
      }
    })
  }

  // Common queries
  select(tablename: string, condition?: string) {
    this.connection.execute(`SELECT * FROM ? ${condition ? `WHERE ${condition}` : ''};`, [tablename],
      (err, results) => {
      if (err) {
        console.warn('Error executing SELECT query:', err)
        return
      }
      return results
    })
  }
  insert(tablename: string, object: any) {
    this.connection.execute(`INSERT INTO ? (?) VALUES (?);`, [
      tablename,
      Object.keys(object),
      Object.values(object),
    ])
  }
  update(tablename: string, object: any, condition: string) {
    this.connection.execute(`UPDATE ? SET ? WHERE ?;`, [
      tablename,
      object,
      condition,
    ])
  }
  delete(tablename: string, condition: string) {
    this.connection.execute(`DELETE FROM ? WHERE ?;`, [
      tablename,
      condition,
    ])
  }

  // Add more methods as needed
  clear(tablename: string) {
    this.connection.execute(`TRUNCATE TABLE ?;`, [tablename])
  }
  // You can't drop database right now, since its required for the connection
  // You better drop database manually in admin panel
  drop(tablename: string) {
    this.connection.execute(`DROP TABLE ?;`, [tablename])
  }
}
