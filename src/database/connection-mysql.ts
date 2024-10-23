interface ServerConfig {
  host: string;
  port: number;
  database: string;
}

interface RoleConfig {
  user: string;
  password: string;
}

/** Modify connection to server from here */
const server: ServerConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'website-sekolah',
};

const roles: Record<string, RoleConfig> = {
  root: {
    user: 'root',
    password: process.env.DB_ROOT_PASSWORD || '', // TODO: Set up secure password
  },
  first: {
    user: `${server.database}-1`,
    password: process.env.DB_FIRST_PASSWORD || '1234', // Use env var for prod
  },
  second: {
    user: `${server.database}-2`,
    password: process.env.DB_SECOND_PASSWORD || '5678', // Use env var for prod
  },
};

/** List of database connections, each has different privileges. */
const connections = {
  /** Only for development, **DO NOT USE IN PRODUCTION** */
  root: {
    ...server,
    ...roles.root,
  },
  first: {
    ...server,
    ...roles.first,
  },
  second: {
    ...server,
    ...roles.second,
  },
};

export default connections;
