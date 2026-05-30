import { Pool } from 'pg'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import bcrypt from 'bcryptjs'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id               SERIAL PRIMARY KEY,
      type             TEXT NOT NULL,
      name             TEXT NOT NULL,
      description      TEXT NOT NULL DEFAULT '',
      "shortDescription" TEXT NOT NULL DEFAULT '',
      area             INTEGER NOT NULL DEFAULT 20,
      capacity         INTEGER NOT NULL DEFAULT 2,
      floor            INTEGER NOT NULL DEFAULT 1,
      "priceMin"       INTEGER NOT NULL DEFAULT 0,
      "priceMax"       INTEGER NOT NULL DEFAULT 0,
      "priceLabel"     TEXT NOT NULL DEFAULT '',
      amenities        JSONB NOT NULL DEFAULT '[]',
      furniture        JSONB NOT NULL DEFAULT '[]',
      images           JSONB NOT NULL DEFAULT '[]',
      available        BOOLEAN NOT NULL DEFAULT TRUE,
      "totalRooms"     INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id           TEXT PRIMARY KEY,
      "guestName"  TEXT NOT NULL,
      phone        TEXT NOT NULL,
      email        TEXT NOT NULL DEFAULT '',
      "roomId"     INTEGER NOT NULL,
      "roomName"   TEXT NOT NULL,
      "checkIn"    TEXT NOT NULL,
      "checkOut"   TEXT NOT NULL,
      adults       INTEGER NOT NULL DEFAULT 1,
      children     INTEGER NOT NULL DEFAULT 0,
      comment      TEXT NOT NULL DEFAULT '',
      status       TEXT NOT NULL DEFAULT 'pending',
      "totalDays"  INTEGER NOT NULL DEFAULT 1,
      "createdAt"  TEXT NOT NULL,
      "updatedAt"  TEXT
    );

    CREATE TABLE IF NOT EXISTS admin (
      id             SERIAL PRIMARY KEY,
      username       TEXT UNIQUE NOT NULL,
      "passwordHash" TEXT NOT NULL,
      name           TEXT NOT NULL
    );
  `)

  // Seed rooms if empty
  const { rows: roomRows } = await pool.query('SELECT COUNT(*) as c FROM rooms')
  if (parseInt(roomRows[0].c) === 0) {
    const roomsPath = resolve('./server/data/rooms.json')
    if (existsSync(roomsPath)) {
      const rooms = JSON.parse(readFileSync(roomsPath, 'utf-8'))
      for (const r of rooms) {
        await pool.query(
          `INSERT INTO rooms (id, type, name, description, "shortDescription", area, capacity, floor,
            "priceMin", "priceMax", "priceLabel", amenities, furniture, images, available, "totalRooms")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
          [r.id, r.type, r.name, r.description, r.shortDescription, r.area, r.capacity, r.floor,
           r.priceMin, r.priceMax, r.priceLabel, JSON.stringify(r.amenities),
           JSON.stringify(r.furniture), JSON.stringify(r.images), r.available, r.totalRooms]
        )
      }
      // Reset sequence after manual ID insert
      await pool.query(`SELECT setval('rooms_id_seq', (SELECT MAX(id) FROM rooms))`)
      console.log(`✓ Seeded ${rooms.length} rooms`)
    }
  }

  // Seed admin if empty
  const { rows: adminRows } = await pool.query('SELECT COUNT(*) as c FROM admin')
  if (parseInt(adminRows[0].c) === 0) {
    const adminPath = resolve('./server/data/admin.json')
    let username = 'admin', passwordHash = '', name = 'Манана'
    if (existsSync(adminPath)) {
      const a = JSON.parse(readFileSync(adminPath, 'utf-8'))
      username = a.username; passwordHash = a.passwordHash; name = a.name
    } else {
      passwordHash = await bcrypt.hash('admin123', 10)
    }
    await pool.query(
      'INSERT INTO admin (username, "passwordHash", name) VALUES ($1,$2,$3)',
      [username, passwordHash, name]
    )
    console.log('✓ Seeded admin')
  }
}

export function parseRoom(r: Record<string, unknown>) {
  return {
    ...r,
    priceMin: r.priceMin ?? r['priceMin'],
    priceMax: r.priceMax ?? r['priceMax'],
    available: Boolean(r.available),
  }
}

export default pool
