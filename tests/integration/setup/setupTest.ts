import { db } from '../../../src/db/connection.ts'
import {
  users,
  habits,
  entries,
  tags,
  habitTags,
} from '../../../src/db/schema.ts'
import { sql } from 'drizzle-orm'
import { execSync } from 'child_process'

export default async function setup() {
  console.log('Running global setup...')

  try {
    await db.execute(sql`DROP TABLE IF EXISTS ${habitTags}`)
    await db.execute(sql`DROP TABLE IF EXISTS ${tags}`)
    await db.execute(sql`DROP TABLE IF EXISTS ${entries}`)
    await db.execute(sql`DROP TABLE IF EXISTS ${habits}`)
    await db.execute(sql`DROP TABLE IF EXISTS ${users}`)

    console.log('Pushing schema using drizzle-kit...')
    execSync(
      `npx drizzle-kit push --url="${process.env.DATABASE_URL}" --schema="../../../src/db/schema.ts" --dialect="postgresql"`,
      { stdio: 'inherit' }
    )
  } catch (error) {
    console.error('DB setup failed:', error)
  }
}
