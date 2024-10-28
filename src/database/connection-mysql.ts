interface ServerConfig {
  host: string
  port: number
  database: string
}

interface RoleConfig {
  user: string
  password: string
}

/** Modify connection to server from here */
const server: ServerConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'website-sekolah',
}

const roles: Record<string, RoleConfig> = {
  root: {
    user: 'root',
    password: process.env.DB_ROOT_PASSWORD || '', // TODO: Set up secure password
  },
  lvl1: {
    user: `${server.database}-1`,
    password: process.env.DB_FIRST_PASSWORD || '1234', // Use env var for prod
  },
  lvl2: {
    user: `${server.database}-1`,
    password: process.env.DB_SECOND_PASSWORD || '5678', // Use env var for prod
  },
}


const connections = {}
for (const role in roles) {
  //@ts-ignore just list of connections
  connections[role] = {
    host: server.host,
    port: server.port,
    user: roles[role].user,
    password: roles[role].password,
    database: server.database,
  }
}

export default connections
