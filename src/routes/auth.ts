'use server'

import type { APIEvent } from '@solidjs/start/server'
import { MariaDBPool } from '~/lib/backend/db'
import { connections } from '~/lib/backend/server.config'
import crypto from 'crypto'

function validateRegistrationData(data: any): string | null {
  const validations = [
    { condition: !data.email || typeof data.email !== 'string', message: 'Email must be a string' },
    { condition: data.email.length >= 255, message: 'Email must be less than 255 characters' },
    {
      condition: !data.password || typeof data.password !== 'string',
      message: 'Password must be a string',
    },
    {
      condition: data.password.length >= 255,
      message: 'Password must be less than 255 characters',
    },
    {
      condition: !data.nickname || typeof data.nickname !== 'string',
      message: 'Nickname must be a string',
    },
    { condition: data.nickname.length >= 64, message: 'Nickname must be less than 64 characters' },
  ]
  
  for (const { condition, message } of validations) {
    if (condition) return message
  }
  
  return null
}

const rootDB = new MariaDBPool(
  { ...connections().server, ...connections().users.root },
  { name: connections().database }
)
const readonlyDB = new MariaDBPool(
  { ...connections().server, ...connections().users.readonly },
  { name: connections().database }
)
const readwriteDB = new MariaDBPool(
  { ...connections().server, ...connections().users.readwrite },
  { name: connections().database }
)

// Register
export async function POST({ request }: APIEvent) {
  // Parse JSON request body
  let data
  try {
    data = await request.json()
    const dataLog = data.password.replace(/./g, '*') // Replace password with asterisks
    console.log('[auth] POST:', dataLog)
  } catch (error) {
    return new Response('400 Bad Request: Invalid JSON format', { status: 400 })
  }

  // Validate the request data
  const validationError = validateRegistrationData(data)
  if (validationError) {
    return new Response(`400 Bad Request: ${validationError}`, { status: 400 })
  }

  try {
    await initDB()
    data.password = hashPassword(data.password)
    readwriteDB.insert('users', data)
  } catch (error) {
    console.error('Registration error:', error)
    return new Response('500 Internal Server Error', { status: 500 })
  }

  return new Response('200 Test', { status: 200 })
}

export function GET() {
  // Login
  // ...
}

export function PATCH() {
  // Update account
  // ...
}

export function DELETE() {
  // Remove account
  // ...
}


async function initDB() {
  // Initialize the database
  await rootDB.init()
  await rootDB.makeRoles([connections().users.readonly, connections().users.readwrite])
  return rootDB
}

function hashPassword(password: string): string {
  if (!password) {
    throw new Error('Password cannot be empty')
  }

  const salt = crypto.randomBytes(16).toString('hex') // Generate a random salt
  const iterations = 100000 // Number of iterations
  const keyLength = 64 // Length of the derived key
  const digest = 'sha512' // Hashing algorithm

  const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest).toString('hex')

  // Return the salt and hash together
  return `${salt}:${hash}`
}

function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  if (!plainPassword || !hashedPassword) {
    throw new Error('Both plain password and hashed password must be provided')
  }

  const [salt, originalHash] = hashedPassword.split(':') // Extract salt and hash
  const iterations = 100000 // Must match the original iterations
  const keyLength = 64 // Must match the original key length
  const digest = 'sha512' // Must match the original hashing algorithm

  const hash = crypto.pbkdf2Sync(plainPassword, salt, iterations, keyLength, digest).toString('hex')

  return hash === originalHash // Compare the hashes
}
