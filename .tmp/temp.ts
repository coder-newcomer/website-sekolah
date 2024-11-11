import mysql from 'mysql2'
import { connections } from '../src/lib/backend/server.config'
import { MariaDBPool } from '../src/lib/backend/db'

fetch('http://localhost:3000/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: '1234',
    nickname: 'User',
  }),
})
  .then((response) => response.text())
  .then((body) => console.log(body))

// const db = new Database(connections().root)

// db.insert('users', { email: 'user@example.com', password: '1234', nickname: 'User' })