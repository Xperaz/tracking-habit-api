import { describe, it, expect } from 'vitest'
import { db } from '../../../src/db/connection.ts'
import { users } from '../../../src/db/schema.ts'
import { eq } from 'drizzle-orm'

describe('basic math integration', () => {
  it('adds two numbers correctly', () => {
    const a = 2
    const b = 3
    expect(a + b).toBe(5)
  })
})

describe('edge case', () => {
  it('adds two numbers correctly', () => {
    const a = 2
    const b = 0
    expect(a + b).toBe(2)
  })
})

test('DB is clean', async () => {
  const all = await db.select().from(users)
  console.log('Users in DB:', all)
  expect(all.length).toBe(0)
})
