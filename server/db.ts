import Database from 'better-sqlite3'
import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'
import bcrypt from 'bcryptjs'

const DB_PATH = process.env.DB_PATH || resolve('./server/data/relax.db')

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id          INTEGER PRIMARY KEY,
    type        TEXT NOT NULL,
    name        TEXT NOT NULL,
    description TEXT NOT NULL,
    shortDescription TEXT NOT NULL,
    area        INTEGER NOT NULL,
    capacity    INTEGER NOT NULL,
    floor       INTEGER NOT NULL DEFAULT 1,
    priceMin    INTEGER NOT NULL,
    priceMax    INTEGER NOT NULL,
    priceLabel  TEXT NOT NULL,
    amenities   TEXT NOT NULL DEFAULT '[]',
    furniture   TEXT NOT NULL DEFAULT '[]',
    images      TEXT NOT NULL DEFAULT '[]',
    available   INTEGER NOT NULL DEFAULT 1,
    totalRooms  INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id          TEXT PRIMARY KEY,
    guestName   TEXT NOT NULL,
    phone       TEXT NOT NULL,
    email       TEXT NOT NULL DEFAULT '',
    roomId      INTEGER NOT NULL,
    roomName    TEXT NOT NULL,
    checkIn     TEXT NOT NULL,
    checkOut    TEXT NOT NULL,
    adults      INTEGER NOT NULL DEFAULT 1,
    children    INTEGER NOT NULL DEFAULT 0,
    comment     TEXT NOT NULL DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'pending',
    totalDays   INTEGER NOT NULL DEFAULT 1,
    createdAt   TEXT NOT NULL,
    updatedAt   TEXT
  );

  CREATE TABLE IF NOT EXISTS admin (
    id           INTEGER PRIMARY KEY,
    username     TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    name         TEXT NOT NULL
  );
`)

// Seed rooms from JSON if table is empty
const roomCount = (db.prepare('SELECT COUNT(*) as c FROM rooms').get() as { c: number }).c
if (roomCount === 0) {
  const roomsPath = resolve('./server/data/rooms.json')
  if (existsSync(roomsPath)) {
    const rooms = JSON.parse(readFileSync(roomsPath, 'utf-8'))
    const insert = db.prepare(`
      INSERT INTO rooms (id, type, name, description, shortDescription, area, capacity, floor,
        priceMin, priceMax, priceLabel, amenities, furniture, images, available, totalRooms)
      VALUES (@id, @type, @name, @description, @shortDescription, @area, @capacity, @floor,
        @priceMin, @priceMax, @priceLabel, @amenities, @furniture, @images, @available, @totalRooms)
    `)
    const insertMany = db.transaction((rows: typeof rooms) => {
      for (const r of rows) {
        insert.run({
          ...r,
          amenities: JSON.stringify(r.amenities),
          furniture: JSON.stringify(r.furniture),
          images: JSON.stringify(r.images),
          available: r.available ? 1 : 0,
        })
      }
    })
    insertMany(rooms)
    console.log(`✓ Imported ${rooms.length} rooms from JSON`)
  }
}

// Seed bookings from JSON if table is empty
const bookingCount = (db.prepare('SELECT COUNT(*) as c FROM bookings').get() as { c: number }).c
if (bookingCount === 0) {
  const bookingsPath = resolve('./server/data/bookings.json')
  if (existsSync(bookingsPath)) {
    const bookings = JSON.parse(readFileSync(bookingsPath, 'utf-8'))
    if (bookings.length > 0) {
      const insert = db.prepare(`
        INSERT INTO bookings (id, guestName, phone, email, roomId, roomName, checkIn, checkOut,
          adults, children, comment, status, totalDays, createdAt, updatedAt)
        VALUES (@id, @guestName, @phone, @email, @roomId, @roomName, @checkIn, @checkOut,
          @adults, @children, @comment, @status, @totalDays, @createdAt, @updatedAt)
      `)
      const insertMany = db.transaction((rows: typeof bookings) => {
        for (const b of rows) insert.run({ updatedAt: null, ...b })
      })
      insertMany(bookings)
      console.log(`✓ Imported ${bookings.length} bookings from JSON`)
    }
  }
}

// Seed admin if table is empty
const adminCount = (db.prepare('SELECT COUNT(*) as c FROM admin').get() as { c: number }).c
if (adminCount === 0) {
  const adminPath = resolve('./server/data/admin.json')
  if (existsSync(adminPath)) {
    const admin = JSON.parse(readFileSync(adminPath, 'utf-8'))
    db.prepare('INSERT INTO admin (username, passwordHash, name) VALUES (?, ?, ?)')
      .run(admin.username, admin.passwordHash, admin.name)
    console.log('✓ Imported admin from JSON')
  } else {
    const hash = bcrypt.hashSync('admin123', 10)
    db.prepare('INSERT INTO admin (username, passwordHash, name) VALUES (?, ?, ?)')
      .run('admin', hash, 'Манана')
    console.log('✓ Created default admin (admin / admin123)')
  }
}

// Helpers for JSON array columns
export function parseRoom(r: Record<string, unknown>) {
  if (!r) return null
  return {
    ...r,
    amenities: JSON.parse(r.amenities as string),
    furniture: JSON.parse(r.furniture as string),
    images: JSON.parse(r.images as string),
    available: Boolean(r.available),
  }
}

export default db
