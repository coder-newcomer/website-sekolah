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
import type { DBConnection, DBPermission, DBUser } from './db'

/** Modify connection to server from here, or setup `.env` variables */

const connections = () => {
  return {
    server: {
      host: '127.0.0.1',
      port: 3306,
    },
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

/** Path that contains the SQL file to import */
const SQL_FILE = async () => {
  return path.join(process.cwd(), 'src/secret/db.sql')
}

export { metadata, dropdown, connections, SQL_FILE }
