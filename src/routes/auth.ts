'use server'
import type { APIEvent } from '@solidjs/start/server'
import { useSession } from 'vinxi/http'

import { db } from '~/lib/backend/server.config'
import { comparePassword, hashPassword, type SQLError } from '~/lib/backend/db'

const DB = await db()
function validateRegistrationData(data: {
  type: 'register' | 'login' | 'update'
  email: string
  password: string
  nickname?: string
}): string | null {
  console.log(
    'Email:',
    data.email,
    'is',
    !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.email) ? 'invaild' : 'valid'
  )
  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.email)) {
    return 'Invalid email'
  } else if (data.password.length < 4 || data.password.length > 64) {
    return 'Password length must be between 4 and 64 characters'
  } else if (data.type === 'register' && data.nickname!.length > 64) {
    return 'Nickname length must be less than 64 characters'
  } else {
    return null
  }
}

// Register
export async function POST({ request }: APIEvent) {
  // Parse JSON request body
  let data
  try {
    data = await request.json()
  } catch (error) {
    return new Response(JSON.stringify({ error: 'ERR_JSON', message: error }), { status: 400 })
  }

  // Validate the request data
  const validationError = validateRegistrationData({
    type: 'register',
    ...data,
  })
  if (validationError) {
    return new Response(JSON.stringify({ error: 'ERR_VALIDATION', message: validationError }), {
      status: 400,
    })
  }

  try {
    if (DB) {
      data.password = await hashPassword(data.password)
      await DB.dbReadWrite.insert('users', data)
      return new Response(
        JSON.stringify({ error: 'OK', message: 'User registered successfully. Now you can login' }),
        { status: 201 }
      )
    } else {
      throw new Error('Database is not initialized')
    }
  } catch (error) {
    const ERR = error as SQLError
    console.error('[auth] POST:', ERR)
    return new Response(
      JSON.stringify({ error: ERR.code, message: ERR.sqlMessage || ERR.message }),
      {
        status: 500,
      }
    )
  }
}

// Login
export async function GET({ request }: APIEvent) {
  // Login
  const url = new URL(request.url)
  const data = {
    email: url.searchParams.get('email'),
    password: url.searchParams.get('password'),
  } as { email: string; password: string }
  console.log('[auth] GET:', data)

  // Validate the request data
  const validationError = validateRegistrationData({
    type: 'login',
    ...data,
  })
  if (validationError) {
    return new Response(JSON.stringify({ error: 'ERR_VALIDATION', message: validationError }), {
      status: 400,
    })
  }

  try {
    if (DB) {
      const user = await DB.dbReadOnly.select('users', 'email = "' + data.email + '"')
      if (user.length > 0) {
        console.log('[auth] User found:', user[0])
        if (await comparePassword(data.password!, user[0].password)) {
          console.log('[auth] Credential matched')
          const session = await getSession()
          await session.update((d) => {
            d.userId = user[0].id
          })
          return new Response(
            JSON.stringify({
              error: 'OK',
              message: 'Login successful',
            }),
            {
              status: 200,
            }
          )
        } else {
          console.log('[auth] Credential not matched')
          return new Response(
            JSON.stringify({
              error: 'ERR_CRED_INVALID',
              message: 'Invalid email or password',
            }),
            {
              status: 401,
            }
          )
        }
      } else {
        console.log(`[auth] User not found for ${data.email}`)
        return new Response(
          JSON.stringify({
            error: 'ERR_USER_NOT_FOUND',
            message: 'Account did not exist, please register',
          }),
          {
            status: 404,
          }
        )
      }
    } else {
      throw new Error('Database is not initialized')
    }
  } catch (error) {
    const ERR = error as SQLError
    console.error('[auth] GET:', ERR)
    return new Response(
      JSON.stringify({ error: ERR.code, message: ERR.sqlMessage || ERR.message }),
      {
        status: 500,
      }
    )
  }
}

export function PATCH() {
  // Update account
  // ...
}

export function DELETE() {
  // Remove account
  // ...
}

function getSession() {
  return useSession({
    password:
      process.env.SESSION_SECRET ??
      'A SUPER SECRET KEY PASSPHRASE THAT MUST BE LONGER THAN 32 CHARACTERS!!!',
  })
}
