/** PLAIN SERVER
import { App } from '@sifrr/server'

const port = 3000
const host = '0.0.0.0'

const app = new App()

app
  .get('/*', (res, req) => {
    res.end('Hello World!')
  })
  .listen(host, port, (token) => {
    if (token) {
      console.log(`Listening at http://${host}:${port}`)
    } else {
      console.log(`Failed listening at http://${host}:${port}`)
    }
  })
*/

/** MARIADB SERVER */
const { execFile, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const os = require('os')
const glob = require('glob')

const sqlFilePath = path.join('./src/database/website_sekolah.sql') // Path to your SQL file

let mariadbProcess // To hold reference to the mysqld process for cleanup

/**
 * Detects the MariaDB installation path based on platform-specific directories.
 * Uses glob to support version-specific folders (e.g., MariaDB 11.5).
 * @returns {string} The path to the MariaDB binary or throws an error if not found.
 */
function detectMariaDBPath() {
  const platform = os.platform()
  const possiblePatterns = []

  if (platform === 'win32') {
    possiblePatterns.push(
      'C:/Program Files/MariaDB*/bin/mysqld.exe',
      'C:/Program Files/MySQL*/bin/mysqld.exe'
    )
  } else if (platform === 'darwin') {
    possiblePatterns.push('/usr/local/opt/mariadb*/bin/mysqld')
  } else if (platform === 'linux') {
    possiblePatterns.push('/usr/bin/mysqld', '/usr/local/bin/mysqld')
  } else if (platform === 'android') {
    possiblePatterns.push('~/../usr/bin/mysqld', '~/../usr/local/bin/mysqld')
  } else {
    console.error("We can't detect the MariaDB binary for your platform.")
  }

  for (const pattern of possiblePatterns) {
    const matches = glob.sync(pattern)
    if (matches.length > 0) {
      return matches[0] // Return the first matched path
    }
  }
  throw new Error('MariaDB binary not found. Ensure MariaDB is installed.')
}

/**
 * Starts the MariaDB server.
 * @param {string} mariadbPath - Path to the MariaDB binary.
 */
function startMariaDBServer(mariadbPath) {
  console.log(`Starting MariaDB server from ${mariadbPath}...`)

  mariadbProcess = spawn(mariadbPath, [], { detached: true })

  mariadbProcess.stdout.on('data', (data) => {
    console.log(`MariaDB: ${data}`)
  })

  mariadbProcess.stderr.on('data', (data) => {
    console.error(`MariaDB Error: ${data}`)
  })

  mariadbProcess.on('close', (code) => {
    console.log(`MariaDB server exited with code ${code}`)
  })

  return mariadbProcess
}

/**
 * Imports an SQL file into MariaDB.
 * @param {string} sqlFile - Path to the SQL file.
 */
function importSQL(sqlFile) {
  const mysqlCommand = os.platform() === 'win32' ? 'mysql.exe' : 'mysql'
  const commandPath = detectMariaDBPath().replace('mysqld', mysqlCommand).replace('.exe.exe', '.exe')
  

  if (!fs.existsSync(sqlFile)) {
    console.error(`SQL file not found: ${sqlFile}`)
    return
  }

  console.log(`Importing SQL file ${sqlFile}...`)

  execFile(commandPath, ['-u', 'root', '-p', '<', sqlFile], (error, stdout, stderr) => {
    if (error) {
      console.error(`Error importing SQL file: ${error.message}`)
      return
    }
    if (stderr) {
      console.error(`Import Error: ${stderr}`)
    }
    console.log(`SQL Import Result: ${stdout}`)
  })
}

/**
 * Clean up and terminate the MariaDB server process on error or termination signal.
 */
function cleanupAndExit() {
  if (mariadbProcess) {
    console.log('Terminating MariaDB server...')
    process.kill(mariadbProcess.pid) // Terminate the detached mysqld process
  }
  process.exit()
}

// Main setup function
async function setupMariaDB() {
  try {
    const mariadbPath = detectMariaDBPath()
    mariadbProcess = startMariaDBServer(mariadbPath)

    setTimeout(() => {
      importSQL(sqlFilePath)
    }, 5000) // Wait 5 seconds for server startup

    // Attach signal handlers for graceful termination
    process.on('SIGINT', cleanupAndExit) // Handle Ctrl+C interrupt
    process.on('SIGTERM', cleanupAndExit) // Handle termination signal
    process.on('uncaughtException', (error) => {
      console.error(`Uncaught Exception: ${error.message}`)
      cleanupAndExit()
    })
  } catch (error) {
    console.error(`Setup Error: ${error.message}`)
    cleanupAndExit()
  }
}

setupMariaDB()
