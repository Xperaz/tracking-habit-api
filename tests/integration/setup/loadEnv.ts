import dotenv from 'dotenv'

// Force load `.env.test` ONLY
dotenv.config({ path: '.env.test' })

if (!process.env.DATABASE_URL) {
  throw new Error('❌ Failed to load .env.test — DATABASE_URL missing')
}

if (process.env.NODE_ENV !== 'test') {
  process.env.NODE_ENV = 'test'
}

console.log('✔️ Loaded .env.test for integration tests')
