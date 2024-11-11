import mysql, { Pool, RowDataPacket } from 'mysql2/promise'

interface DBUser {
  user: string
  password: string
}

interface DBConnection extends DBUser {
  host: string
  port: number
}

interface DBRole extends DBUser {
  access: string | '%' | 'localhost'
  delete?: boolean
  force?: boolean
}

interface DBPermission extends DBRole {
  grant: string[]
  revoke: string[]
}

export type { DBUser, DBConnection, DBRole, DBPermission }

export class MariaDBPool {
  private poolConfig: DBConnection
  private db: { dbname: string; force?: boolean }
  private pool: Pool | null = null

  constructor(poolConfig: DBConnection, db: { dbname: string; force?: boolean }) {
    this.poolConfig = poolConfig
    this.db = db
  }

  /**
   * Initialize the database, create if not exists or drop and recreate if force is true
   */
  async init(): Promise<void> {
    await this.createPool()

    try {
      if (this.db.force) {
        await this.execute(`DROP DATABASE IF EXISTS \`${this.db.dbname}\``)
        console.log(`[db] Database ${this.db.dbname} dropped.`)
      }

      await this.execute(`CREATE DATABASE IF NOT EXISTS \`${this.db.dbname}\``)
      console.log(`[db] Database ${this.db.dbname} is ready.`)
    } catch (error) {
      console.error(`Database initialization error:`, error)
      throw error
    }
  }

  /**
   * Create a connection pool to the database
   */
  private async createPool() {
    if (!this.pool) {
      this.pool = mysql.createPool({
        host: this.poolConfig.host,
        port: this.poolConfig.port,
        user: this.poolConfig.user,
        password: this.poolConfig.password,
        database: this.db.dbname,
        waitForConnections: true,
        connectionLimit: 10, // Adjust based on expected load
        queueLimit: 0,
      })
      console.log(`[db] Connection pool created for database ${this.db.dbname}`)
    }
  }

  /**
   * Close the pool and release all connections
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
      this.pool = null
      console.log('[db] Connection pool closed.')
    }
  }

  /**
   * Execute a generic query
   */
  async execute(query: string, params: any[] = []): Promise<RowDataPacket[]> {
    await this.createPool()
    try {
      const [rows] = await this.pool!.execute(query, params)
      return rows as RowDataPacket[]
    } catch (error) {
      // console.error('Execution error:') console.error('Execution error:') // For better logging, handle error using `try...catch` every use
      throw error
    }
  }

  /**
   * Select query
   */
  async select(table: string, where: string = '1=1'): Promise<RowDataPacket[]> {
    return this.execute(`SELECT * FROM \`${table}\` WHERE ${where}`)
  }

  /**
   * Insert query
   */
  async insert(table: string, data: Record<string, any>): Promise<void> {
    const columns = Object.keys(data).join(', ')
    const values = Object.values(data)
    const placeholders = values.map(() => '?').join(', ')

    await this.execute(`INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders})`, values)
  }

  /**
   * Update query
   */
  async update(table: string, data: Record<string, any>, where: string): Promise<void> {
    const setClause = Object.keys(data)
      .map((key) => `\`${key}\` = ?`)
      .join(', ')
    const values = Object.values(data)

    await this.execute(`UPDATE \`${table}\` SET ${setClause} WHERE ${where}`, values)
  }

  /**
   * Delete query
   */
  async delete(table: string, where: string): Promise<void> {
    await this.execute(`DELETE FROM \`${table}\` WHERE ${where}`)
  }

  /**
   * Clear table
   */
  async clearTable(table: string): Promise<void> {
    await this.execute(`TRUNCATE TABLE \`${table}\``)
  }

  /**
   * Make roles based on DBRole or DBPermission configurations
   */
  async makeRoles(roles: (DBRole | DBPermission)[]): Promise<void> {
    for (const role of roles) {
      if (role.delete) {
        // Drop the role if specified
        await this.execute(`DROP USER IF EXISTS '${role.user}'@'${role.access}'`)
        console.log(`[db] Dropped user: ${role.user}@${role.access}`)
      } else {
        // Create role if it doesn't exist
        const forceCreate = role.force ? ' OR REPLACE' : ' IF NOT EXISTS'
        await this.execute(
          `CREATE USER${forceCreate} '${role.user}'@'${role.access}' IDENTIFIED BY '${role.password}'`
        )
        console.log(`[db] Created user: ${role.user}@${role.access}`)

        // Manage permissions
        if ('grant' in role || 'revoke' in role) {
          const permissionRole = role as DBPermission

          // Prepare revoke and grant queries
          const revokeQueries =
            permissionRole.revoke.length > 0
              ? `REVOKE ${permissionRole.revoke.join(', ')} ON \`${this.db.dbname}\`.* FROM '${
                  role.user
                }'@'${role.access}'`
              : ''

          const grantQueries =
            permissionRole.grant.length > 0
              ? `GRANT ${permissionRole.grant.join(', ')} ON \`${this.db.dbname}\`.* TO '${
                  role.user
                }'@'${role.access}'`
              : ''

          // Execute revoke and grant in a single statement if both exist
          if (revokeQueries && grantQueries) {
            await this.execute(`${grantQueries}; ${revokeQueries}`) // Prioritize revoking
          } else if (revokeQueries) {
            await this.execute(revokeQueries)
          } else if (grantQueries) {
            await this.execute(grantQueries)
          }

          if (revokeQueries) {
            console.log(`[db] Revoked ${permissionRole.revoke.join(', ')} from ${role.user}@${role.access}`)
          }
          if (grantQueries) {
            console.log(`[db] Granted ${permissionRole.grant.join(', ')} to ${role.user}@${role.access}`)
          }
        }
      }
    }
  }
}

export interface SQLError extends Error {
  code: string
  errno: number
  sql: string
  sqlState: string
  sqlMessage: string
}

/** Password utils */

import { randomBytes, scrypt as _scrypt } from 'crypto'
import { promisify } from 'util'

const scrypt = promisify(_scrypt)

const HASHING_ALGORITHM = 'sha256' // You can choose another algorithm if needed
const KEY_LENGTH = 64 // Length of the derived key
const ITERATIONS = 100000 // Number of iterations for scrypt

export async function hashPassword(password: string): Promise<string> {
  // Generate a random salt
  const salt = randomBytes(16).toString('hex')

  // Hash the password using scrypt
  const hashedBuffer = await scrypt(password, salt, KEY_LENGTH) as Buffer

  // Combine salt and hash into a single string
  const hashedPassword = `${salt}:${hashedBuffer.toString('hex')}`

  return hashedPassword
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  // Split the hashed password into salt and hash
  const [salt, originalHash] = hashedPassword.split(':')

  // Hash the incoming password with the same salt
  const hashedBuffer = await scrypt(password, salt, KEY_LENGTH) as Buffer

  // Compare the hashed buffer with the original hash
  return originalHash === hashedBuffer.toString('hex')
}