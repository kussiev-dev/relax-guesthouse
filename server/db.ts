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

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value JSONB NOT NULL
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

  // Upsert site-wide settings (header/footer)
  const siteDefaults = {
    header: {
      phone: '+79186723781',
      phoneDisplay: '+7 (918) 672-37-81',
    },
    footer: {
      description: 'Уютный гостевой дом в 5 минутах от моря. 18 номеров разных категорий для комфортного семейного отдыха.',
      phones: [
        { number: '+79186723781', display: '+7 (918) 672-37-81', label: '' },
        { number: '+79186397266', display: '+7 (918) 639-72-66', label: 'Манана' },
      ],
      email: 'mananarelax@gmail.com',
      address: 'Анапа, Джемете, Пионерский проспект 127/а',
    },
  }
  await pool.query(
    `INSERT INTO settings (key, value) VALUES ('site', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1::jsonb || settings.value`,
    [JSON.stringify(siteDefaults)]
  )
  console.log('✓ Site settings synced')

  // Upsert homepage content — merges defaults without overwriting existing fields
  const homepageDefaults = {
    hero: {
      badge: 'Принимаем бронирования',
      title: 'Гостевой дом',
      titleHighlight: 'Релакс',
      subtitle: 'Ваш уютный отдых в Джемете, Анапа',
      description: '5 мин. до моря · Парковка · Wi-Fi · Мангал',
      buttons: [
        { label: 'Забронировать', style: 'filled', action: 'page', target: '/booking' },
        { label: 'Смотреть номера', style: 'outline', action: 'page', target: '/rooms' },
      ],
    },
    features: [
      { icon: '🏖️', title: '5 минут до моря', desc: 'Пешеходная прогулка до пляжа' },
      { icon: '❄️', title: 'Кондиционер', desc: 'В каждом номере' },
      { icon: '📶', title: 'Быстрый Wi-Fi', desc: 'По всей территории' },
      { icon: '🅿️', title: 'Парковка', desc: 'Бесплатная у дома' },
      { icon: '🍖', title: 'Мангал / беседка', desc: 'Для вашего отдыха' },
      { icon: '🛝', title: 'Детская площадка', desc: 'Для маленьких гостей' },
      { icon: '💇', title: 'Салон красоты', desc: 'На территории' },
      { icon: '🛒', title: 'Магазины рядом', desc: 'Магнит и Пятёрочка' },
    ],
    cta: {
      title: 'Готовы к отдыху?',
      description: 'Оставьте заявку — мы свяжемся с вами в течение часа и подтвердим бронирование',
      buttons: [
        { label: 'Забронировать онлайн', style: 'filled', action: 'page', target: '/booking' },
        { label: 'Позвонить', style: 'outline', action: 'phone', target: '' },
      ],
    },
    reviews: [
      { name: 'Елена К.', date: 'Август 2024', text: 'Отличный гостевой дом! Всё чисто, уютно, хозяева очень приветливые. До моря рукой подать. Будем возвращаться!', rating: 5 },
      { name: 'Алексей М.', date: 'Июль 2024', text: 'Провели с семьёй 2 недели. Дети в восторге от площадки. Мангал работает, wi-fi хороший. Рекомендую.', rating: 5 },
      { name: 'Наталья В.', date: 'Июнь 2024', text: 'Брали люкс — огромный номер с кухней. Готовили сами, всё очень удобно. Манана — чудесный человек, помогла с советами по отдыху.', rating: 5 },
    ],
    location: {
      title: 'Как нас найти',
      description: 'Мы находимся в самом центре Джемете — всё рядом!',
      items: [
        { icon: '🏖️', text: 'До пляжа — 5–7 минут пешком' },
        { icon: '🎡', text: 'Аквапарк — 10 минут' },
        { icon: '🛒', text: 'Магнит и Пятёрочка — рядом' },
        { icon: '🎪', text: 'Центр развлечений — 1 минута' },
      ],
      mapUrl: 'https://yandex.ru/maps/?text=Анапа+Джемете+Пионерский+проспект+127',
    },
    contacts: {
      phone: '+79186723781',
      address: 'г. Анапа, Джемете, Пионерский проспект, 127/а',
    },
  }
  // $1::jsonb || value → defaults fill missing keys, existing values win
  await pool.query(
    `INSERT INTO settings (key, value) VALUES ('homepage', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1::jsonb || settings.value`,
    [JSON.stringify(homepageDefaults)]
  )
  console.log('✓ Homepage settings synced')

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

  // Migrate old 'admin' username → 'manana' with new password (one-time)
  const { rows: oldAdmin } = await pool.query("SELECT id FROM admin WHERE username = 'admin'")
  if (oldAdmin.length > 0) {
    const migratedHash = await bcrypt.hash('relax2026', 10)
    await pool.query(
      `UPDATE admin SET username = 'manana', "passwordHash" = $1, name = 'Манана' WHERE username = 'admin'`,
      [migratedHash]
    )
    console.log('✓ Admin migrated to manana/relax2026')
  }
  // Ensure 'manana' account exists if no admin at all
  const { rows: anyAdmin } = await pool.query('SELECT COUNT(*) as c FROM admin')
  if (parseInt(anyAdmin[0].c) === 0) {
    const hash = await bcrypt.hash('relax2026', 10)
    await pool.query(
      `INSERT INTO admin (username, "passwordHash", name) VALUES ('manana', $1, 'Манана')`,
      [hash]
    )
    console.log('✓ Admin manana/relax2026 created')
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
