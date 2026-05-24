#!/usr/bin/env ts-node
/**
 * Скрипт резервного копирования базы данных
 * Запуск: npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/backup.ts
 * 
 * Для автоматического бэкапа добавь в cron (Linux/Mac):
 * 0 2 * * * cd /path/to/flowdesk && npx ts-node scripts/backup.ts
 * 
 * На Windows используй Task Scheduler
 */

import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import * as dotenv from 'dotenv'

dotenv.config()

const DATABASE_URL = process.env.DATABASE_URL!
if (!DATABASE_URL) { console.error('❌ DATABASE_URL не задан'); process.exit(1) }

// Парсим URL базы данных
const url = new URL(DATABASE_URL)
const host = url.hostname
const port = url.port || '5432'
const database = url.pathname.slice(1)
const username = url.username
const password = url.password

// Создаём папку для бэкапов
const backupDir = join(process.cwd(), 'backups')
if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true })

// Имя файла с датой
const date = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const filename = `flowdesk-backup-${date}.sql`
const filepath = join(backupDir, filename)

console.log(`📦 Создаём бэкап базы данных...`)
console.log(`   База: ${database} на ${host}:${port}`)
console.log(`   Файл: ${filepath}`)

try {
  // pg_dump должен быть установлен вместе с PostgreSQL
  const env = { ...process.env, PGPASSWORD: password }
  
  execSync(
    `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f "${filepath}" --no-password`,
    { env, stdio: 'pipe' }
  )

  console.log(`✅ Бэкап создан: ${filename}`)
  console.log(`   Размер: ${require('fs').statSync(filepath).size} байт`)

  // Удаляем бэкапы старше 30 дней
  const { readdirSync, statSync, unlinkSync } = require('fs')
  const files = readdirSync(backupDir)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  let deleted = 0

  files.forEach((file: string) => {
    if (!file.endsWith('.sql')) return
    const stat = statSync(join(backupDir, file))
    if (stat.mtimeMs < thirtyDaysAgo) {
      unlinkSync(join(backupDir, file))
      deleted++
    }
  })

  if (deleted > 0) console.log(`🗑  Удалено старых бэкапов: ${deleted}`)
  console.log(`📁 Всего бэкапов: ${files.length - deleted}`)

} catch (e: any) {
  console.error('❌ Ошибка бэкапа:', e.message)
  console.error('   Убедись что pg_dump доступен (установлен PostgreSQL)')
  process.exit(1)
}
