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
  private db: { name: string; force?: boolean }
  private pool: Pool | null = null

  constructor(poolConfig: DBConnection, db: { name: string; force?: boolean }) {
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
        await this.execute(`DROP DATABASE IF EXISTS \`${this.db.name}\``)
        console.log(`Database ${this.db.name} dropped.`)
      }

      await this.execute(`CREATE DATABASE IF NOT EXISTS \`${this.db.name}\``)
      console.log(`Database ${this.db.name} is ready.`)
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
        database: this.db.name,
        waitForConnections: true,
        connectionLimit: 10, // Adjust based on expected load
        queueLimit: 0,
      })
      console.log(`Connection pool created for database ${this.db.name}`)
    }
  }

  /**
   * Close the pool and release all connections
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
      this.pool = null
      console.log('Connection pool closed.')
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
      console.error('Execution error:')
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
        console.log(`Dropped user: ${role.user}@${role.access}`)
      } else {
        // Create role if it doesn't exist
        const forceCreate = role.force ? ' OR REPLACE' : ' IF NOT EXISTS'
        await this.execute(
          `CREATE USER${forceCreate} '${role.user}'@'${role.access}' IDENTIFIED BY '${role.password}'`
        )
        console.log(`Created user: ${role.user}@${role.access}`)

        // Manage permissions
        if ('grant' in role || 'revoke' in role) {
          const permissionRole = role as DBPermission

          // Revoke permissions
          for (const revokeQuery of permissionRole.revoke) {
            await this.execute(
              `REVOKE ${revokeQuery} ON \`${this.db.name}\`.* FROM '${role.user}'@'${role.access}'`
            )
            console.log(`Revoked ${revokeQuery} from ${role.user}@${role.access}`)
          }

          // Grant permissions
          for (const grantQuery of permissionRole.grant) {
            if (!permissionRole.revoke.includes(grantQuery)) {
              await this.execute(
                `GRANT ${grantQuery} ON \`${this.db.name}\`.* TO '${role.user}'@'${role.access}'`
              )
              console.log(`Granted ${grantQuery} to ${role.user}@${role.access}`)
            }
          }
        }
      }
    }
  }
}
