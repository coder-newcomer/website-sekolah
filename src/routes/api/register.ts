import { redirect } from '@solidjs/router'
import type { APIEvent } from '@solidjs/start/server'
import bcrypt from 'bcrypt'
import mysql from 'mysql2'

import { connections } from '~/secret/config'

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
  const connection = mysql.createConnection(connections.readwrite)
  const sql = `INSERT INTO users (email, password, nickname) VALUES (?, ?, ?)`
  console.log('UserInfo: ' + JSON.stringify(userinfo))
  try {
    connection.execute(sql, [userinfo.email, userinfo.password, userinfo.nickname])
  } catch (error) {
    console.warn(error)
  }
  connection.end()
}

export async function POST({ request }: APIEvent) {
  try {
    data = await request.json()
  } catch (error) {
    return new Response('400 Bad Request: Invalid JSON data', { status: 400 })
  }
  const validationResult = validateUserInfo(data)
  if (validationResult.valid === false) {
    return new Response(`400 Bad Request: ${validationResult.message}`, { status: 400 })
  } else {
    storeUsers(data)
    console.log('Request: ' + JSON.stringify(data))
    return new Response('201 Created', { status: 201 })
  }
  //throw redirect('/')
}

function validateUserInfo(userInfo: UserInfo) {
  const { email, password, nickname } = userInfo

  // Validate email format
  const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  if (!emailPattern.test(email)) {
    return { valid: false, message: 'Invalid email format.' }
  }

  // Validate password length
  if (password.length > 32) {
    return { valid: false, message: 'Password cannot be more than 32 characters long.' }
  }

  // Validate nickname length
  if (nickname.length > 64) {
    return { valid: false, message: 'Nickname cannot be more than 64 characters long.' }
  }

  // If all validations pass
  return { valid: true, message: 'Validation successful.' }
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
