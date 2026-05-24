#!/usr/bin/env ts-node
/**
 * Генерирует безопасный NEXTAUTH_SECRET и обновляет .env
 * Запуск: npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/generate-secret.ts
 */

import { randomBytes } from 'crypto'
import { readFileSync, writeFileSync, existsSync } from 'fs'

const secret = randomBytes(32).toString('base64')
const envPath = '.env'

if (!existsSync(envPath)) {
  console.error('❌ Файл .env не найден. Сначала запусти: copy .env.example .env')
  process.exit(1)
}

let env = readFileSync(envPath, 'utf-8')

if (env.includes('NEXTAUTH_SECRET=your-secret-here')) {
  env = env.replace('NEXTAUTH_SECRET=your-secret-here', `NEXTAUTH_SECRET=${secret}`)
  writeFileSync(envPath, env)
  console.log('✅ NEXTAUTH_SECRET сгенерирован и сохранён в .env')
  console.log(`   ${secret}`)
} else if (env.includes('NEXTAUTH_SECRET=') && !env.match(/NEXTAUTH_SECRET=.{32,}/)) {
  env = env.replace(/NEXTAUTH_SECRET=.*/, `NEXTAUTH_SECRET=${secret}`)
  writeFileSync(envPath, env)
  console.log('✅ NEXTAUTH_SECRET обновлён в .env')
} else {
  console.log('ℹ️  NEXTAUTH_SECRET уже настроен, пропускаем')
  console.log('   Если хочешь сгенерировать новый — удали текущий из .env и запусти снова')
}

console.log('\n🔐 Готово! Перезапусти сервер: npm run dev')
