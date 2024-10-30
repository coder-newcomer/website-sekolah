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
const mysql = require('mysql2')
const connections = require('./connection-mysql')

const sqlFilePath = path.join('./src/database/website_sekolah.sql') // Path to your SQL file

let mariadbProcess // To hold reference to the mariadbd process for cleanup

/**
 * Detects the MariaDB installation path based on platform-specific directories.
 * Uses glob to support version-specific folders (e.g., MariaDB 11.5).
 * @returns {string} The path to the MariaDB binary or throws an error if not found.
 */
function detectMariaDBPath() {
  const possiblePatterns = []

  switch (os.platform()) {
      case 'win32':
        possiblePatterns.push('C:/Program Files/MariaDB*/bin/mariadbd.exe')
      case 'darwin':
        possiblePatterns.push('/usr/local/opt/mariadb*/bin/mariadbd')
      case 'linux':
        possiblePatterns.push('/usr/bin/mariadbd', '/usr/local/bin/mariadbd')
      case 'android':
        possiblePatterns.push('~/../usr/bin/mariadbd', '~/../usr/local/bin/mariadbd')
        break;
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
  const connection = mysql.createConnection(connections.root)
  connection.execute(`source ${sqlFile}`, (error) => {
    if (error) {
      console.warn(`SQL Import Error: ${error.message}`)
    }
    connection.end()
  })
}

/**
 * Clean up and terminate the MariaDB server process on error or termination signal.
 */
function cleanupAndExit() {
  if (mariadbProcess) {
    console.log('Terminating MariaDB server...')
    process.kill(mariadbProcess.pid) // Terminate the detached mariadbd process
  }
  process.exit()
}

// Main setup function
async function setupMariaDB() {
  try {
    mariadbProcess = startMariaDBServer(detectMariaDBPath())

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
