interface ServerConfig {
  host: string
  port: number
  database: string
}

interface Connections extends ServerConfig {
  user: string
  password: string
}

/** Modify connection to server from here */
const server: ServerConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'website-sekolah',
}

const connections: Record<string, Connections> = {
  root: {
    user: 'root',
    password: process.env.DB_ROOT_PASSWORD || '', // TODO: Set up secure password
    ...server,
  },
  readonly: {
    user: `app_readonly`,
    password: process.env.DB_FIRST_PASSWORD || 'App_ReadOnly@1234', // Use env var for prod
    ...server,
  },
  readwrite: {
    user: `app_readwrite`,
    password: process.env.DB_SECOND_PASSWORD || 'App_ReadWrite@1234', // Use env var for prod
    ...server,
  },
}

export default connections
