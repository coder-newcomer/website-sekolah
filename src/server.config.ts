import { join } from 'path'
import mysql from 'mysql2'

/** SCHOOL METADATA */
const metadata = {
  sekolah: 'SMK Karya Nasional Sindangkasih',
  slogan: 'Smart - Competence - Religious',
  email: 'smkkarnascms@gmail.com',
  telp: '02657521244',
  fax: '0822357706',
  alamat:
    'P62M+CCX, Jl. Raya Sidangkasih, RT.09/RW.05, Gunungcupu, Kec. Sindangkasih, Kabupaten Ciamis, Jawa Barat 46268',
}

/** HEADER NAVIGATION URLS*/
const dropdown = {
  Profil: {
    'Sejarah Singkat': '#history',
    'Visi & Misi': '#mission',
    'Sarana & Prasarana': '#facilities',
  },
  Akademik: {
    'Kompetensi Keahlian': '#subject',
    Prestasi: '#achievement',
    Ekskul: '#extracurricular',
  },
  Direktori: {
    Siswa: '/students',
    'Guru & Staff': '/teachers',
  },
  Media: '/media',
  PPDB: '/ppdb',
  'Hubungi Kami': '/contact',
  Lainnya: {
    'Jurnal Matematika': '/math-journal',
    'Kreasi Developer': '/etc',
  },
}

/** DATABASE CONNECTIONS */

interface ServerConfig {
  host: string
  port: number
  database: string
}

interface Connections extends ServerConfig {
  user: string
  password: string
}

/** Modify connection to server from here, or setup `.env` variables */
const server: {host: string; port: number; database: string} = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'website-sekolah',
}

/** Path that contains the SQL file to import */
const SQL_FILE = join(process.cwd(), 'src/secret/db.sql')

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

export type { ServerConfig, Connections }
export { metadata, dropdown, connections }

/** Setting up server */

import { execSync, spawn, ChildProcess } from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from `.env` if available
dotenv.config()

/**
 * Detect the MariaDB binary path by checking:
 * - $PATH environment variable (using `which` on Unix, `where` on Windows)
 * - `.env` file for `MARIADB_PATH`
 * - Common MariaDB binary locations based on OS.
 * @returns The detected MariaDB binary path, or `null` if not found.
 */
function detectMariaDBPath(): string | null {
  const isWindows = os.platform() === 'win32'
  const mariadbBinary = 'mariadbd'

  // 1. Check in $PATH using `which` on Unix, `where` on Windows
  try {
    const command = isWindows ? 'where' : 'which'
    const binaryPath = execSync(`${command} ${mariadbBinary}`, { stdio: 'pipe' }).toString().trim()
    if (binaryPath && fs.existsSync(binaryPath)) {
      return binaryPath
    }
  } catch (err) {
    // Ignore errors if MariaDB is not found in $PATH
  }

  // 2. Check `.env` variable `MARIADB_PATH`
  if (process.env.MARIADB_PATH && fs.existsSync(process.env.MARIADB_PATH)) {
    return process.env.MARIADB_PATH
  }

  // 3. Check common paths based on OS
  const windowsPaths = () => {
      let paths: string[] = []
      const programFiles = [process.env['ProgramFiles(x86)'], process.env['ProgramFiles']]
      fs.readdirSync(programFiles[0]!).forEach((folder) => {
        if (folder.startsWith('MariaDB')) {
          paths.push(path.join(programFiles[0]!, folder, 'bin', 'mariadbd.exe'))
        }
      })
      fs.readdirSync(programFiles[1]!).forEach((folder) => {
        if (folder.startsWith('MariaDB')) {
          paths.push(path.join(programFiles[1]!, folder, 'bin', 'mariadbd.exe'))
        }
      })
      return paths
    }
  const commonPaths = isWindows
    ? windowsPaths()
    : [
        '/usr/local/mariadb/bin/mariadbd', // macOS Homebrew
        '/usr/bin/mariadbd', // Common Unix paths
        '/usr/local/bin/mariadbd',
        '/opt/mariadb/bin/mariadbd', // Custom installation path
      ]

  for (const potentialPath of commonPaths) {
    // Handle wildcard version matching for Windows paths
    if (potentialPath.includes('*')) {
      const versionedPaths = fs.readdirSync(path.dirname(potentialPath.replace('\\*', '')))
      for (const versionPath of versionedPaths) {
        const fullPath = path.join(path.dirname(potentialPath), versionPath, 'bin', 'mariadbd.exe')
        if (fs.existsSync(fullPath)) {
          return fullPath
        }
      }
    } else if (fs.existsSync(potentialPath)) {
      return potentialPath
    }
  }

  console.error(
    'MariaDB binary not found. Please specify the path in the .env file or install MariaDB.'
  )
  return null
}

/**
 * Starts the MariaDB server with the specified host and port.
 * @param host The host to bind MariaDB to.
 * @param port The port for MariaDB to listen on.
 * @returns The child process of the MariaDB server, or null if it fails to start.
 */
function startMariaDBServer(host: string = '127.0.0.1', port: number = 3306): ChildProcess | null {
  const mariadbPath = detectMariaDBPath()

  if (!mariadbPath) {
    console.error('Failed to start MariaDB: Binary path not found.')
    return null
  }

  console.log(`Starting MariaDB server from ${mariadbPath}...`)
  const mariadbProcess = spawn(mariadbPath, [`--bind-address=${host}`, `--port=${port}`])

  let initialized = false

  mariadbProcess.stdout.on('data', (data) => {
    const message = data.toString()
    console.log(`MariaDB: ${message}`)

    // Basic initialization check (for demonstration purposes)
    if (message.includes('ready for connections')) {
      initialized = true
      console.log('MariaDB has started successfully.')
      // Start the web server here if necessary
    }
  })

  mariadbProcess.stderr.on('data', (data) => {
    console.error(`MariaDB Error: ${data}`)
  })

  mariadbProcess.on('close', (code) => {
    console.log(`MariaDB process exited with code ${code}`)
    if (!initialized) {
      console.error('MariaDB failed to initialize. Check configurations and try again.')
    }
  })

  return mariadbProcess
}

/**
 * Sets up termination handlers to gracefully stop the MariaDB server upon receiving
 * termination signals such as Ctrl+C.
 * @param mariadbProcess The MariaDB child process.
 */
function setupTerminationHandlers(mariadbProcess: ChildProcess) {
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT']

  signals.forEach((signal) => {
    process.on(signal, () => {
      console.log(`Received ${signal}. Terminating MariaDB process...`)
      mariadbProcess.kill()
      process.exit(0) // Exit the script after terminating the process
    })
  })
}

function initWebServer() {
  // Setup database
  const connection = mysql.createConnection(connections.root)

  try {
    connection.connect()
    console.log('Database connected')
  } catch (error) {
    console.error('Error when connecting to database:', error)
  }

  try {
    connection.execute(`CREATE DATABASE IF NOT EXISTS \`${server.database}\`;
    USE \`${server.database}\`;
    `)
    console.log(`Database \`${server.database}\` created`)
  } catch (error) {
    console.error('Error when creating database:', error)
  }

  // Import SQL
  try {
    connection.execute(`source ${SQL_FILE}`)
    console.log('SQL imported')
  } catch (error) {
    console.error('Error when importing SQL:', error)
  }
  console.log('Database setup complete')
  connection.end()
  console.log('Now you can start the web server: pnpm run dev')
}

/**
 * Main function to start MariaDB, handle initialization, and set up termination handlers.
 */
async function main() {
  const mariadbProcess = startMariaDBServer()

  if (mariadbProcess) {
    setupTerminationHandlers(mariadbProcess)
    initWebServer()
  }
}

// Run the main function
main()
