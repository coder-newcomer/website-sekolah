'use server'
import * as path from 'path'

/** SCHOOL METADATA */
const metadata = () => {
  return {
    sekolah: 'SMK Karya Nasional Sindangkasih',
    slogan: 'Smart - Competence - Religious',
    email: 'smkkarnascms@gmail.com',
    telp: '02657521244',
    fax: '0822357706',
    alamat:
      'P62M+CCX, Jl. Raya Sidangkasih, RT.09/RW.05, Gunungcupu, Kec. Sindangkasih, Kabupaten Ciamis, Jawa Barat 46268',
  }
}

/** HEADER NAVIGATION URLS*/
const dropdown = () => {
  return {
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
}

/** DATABASE CONNECTIONS */
import { MariaDBPool, type DBConnection, type DBPermission, type DBUser } from './db'

/** Modify connection to server from here, or setup `.env` variables */
/*
const connections = () => {
  return {
    server: server,
    database: 'website-sekolah',
    users: {
      root: {
        user: 'root',
        password: '',
        access: 'localhost',
        grant: [], // Root user has all permissions
        revoke: [],
      },
      readonly: {
        user: 'app_readonly',
        password: '@Read-Only#1234',
        access: 'localhost',
        grant: ['SELECT'],
        revoke: [],
      },
      readwrite: {
        user: 'app_readwrite',
        password: '@Read-Write#5678',
        access: 'localhost',
        grant: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
        revoke: [],
      },
    } as Record<string, DBPermission>,
  }
}
*/

const db = async () => {
  const connection = {
    server: { host: '127.0.0.1', port: 3306 },
    database: 'website-sekolah',
    users: {
      root: {
        user: 'root',
        password: '',
        access: 'localhost',
        grant: [], // Root user has all permissions
        revoke: [],
      },
      readonly: {
        user: 'app_readonly',
        password: '@Read-Only#1234',
        access: 'localhost',
        grant: ['SELECT'],
        revoke: [],
      },
      readwrite: {
        user: 'app_readwrite',
        password: '@Read-Write#5678',
        access: 'localhost',
        grant: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
        revoke: [],
      },
    },
  }
  const dbRoot = new MariaDBPool(
    {
      ...connection.server,
      user: connection.users.root.user,
      password: connection.users.root.password,
    },
    { dbname: connection.database }
  )
  await dbRoot.init()
  await dbRoot.makeRoles([
    {
      user: 'app_readonly',
      password: '@Read-Only#1234',
      access: 'localhost',
      grant: ['SELECT'],
      revoke: [],
    },
    {
      user: 'app_readwrite',
      password: '@Read-Write#5678',
      access: 'localhost',
      grant: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      revoke: [],
    },
  ])
  const dbReadOnly = new MariaDBPool(
    {
      ...connection.server,
      user: connection.users.readonly.user,
      password: connection.users.readonly.password,
    },
    { dbname: connection.database }
  )
  const dbReadWrite = new MariaDBPool(
    {
      ...connection.server,
      user: connection.users.readwrite.user,
      password: connection.users.readwrite.password,
    },
    { dbname: connection.database }
  )
  // Test connection for each user
  try {
    console.log('[server.config] Connection test (Read Only): ', await dbReadOnly.execute('SHOW TABLES'))
    console.log('[server.config] Connection test (Read Write): ', await dbReadWrite.execute('SHOW TABLES'))
    return { dbRoot, dbReadOnly, dbReadWrite } as Record<'dbRoot' | 'dbReadOnly' | 'dbReadWrite', MariaDBPool>
  } catch (error) {
    console.error(`[server.config] Connection test failed: ${error}`)
  }
}

/** Path that contains the SQL file to import */
const SQL_FILE = async () => {
  return path.join(process.cwd(), 'src/secret/db.sql')
}

export { metadata, dropdown, db, SQL_FILE }
