import type { APIEvent } from '@solidjs/start/server'
import bcrypt from 'bcrypt'
import { error, log } from 'console'
import mysql from 'mysql2'

import connections from '~/database/connection-mysql'

// Variables
let data

async function hashPassword(plainPassword: string) {
  // Generate a salt
  const salt = await bcrypt.genSalt(10) // The number 10 is the salt rounds
  // Hash the password with the salt
  const hashedPassword = await bcrypt.hash(plainPassword, salt)
  return hashedPassword
}

interface UserInfo {
  email: string
  password: string
  nickname: string
}

async function storeUsers(userinfo: UserInfo) {
  'use server'
  userinfo.password = await hashPassword(userinfo.password)
  //@ts-ignore
  const connection = await mysql.createConnection(connections.lvl1)
  const sql = `INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)`
  try {
    connection.execute(sql, [userinfo.email, userinfo.password, userinfo.nickname])
  } catch (error) {
    console.warn(error)
  }
}

export async function POST({ request }: APIEvent) {
  data = await request.json()
  console.log('Request: ' + JSON.stringify(data))
  return 'test'
}

/*
async function comparePassword(plainPassword: string, hashedPassword: string) {
 import { log } from 'console';
 return await bcrypt.compare(plainPassword, hashedPassword);
}

// Example usage
(async () => {
  const plainPassword = 'mySecurePassword123';
  const hashedPassword = await hashPassword(plainPassword);
  console.log('Hashed Password:', hashedPassword);
})();
*/
