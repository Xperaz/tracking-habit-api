import { db } from './connection.ts'
import { users, habits, entries, tags, habitTags } from './schema.ts'

const seed = async () => {
  console.log('🌱 Starting database seed...')

  try {
    console.log('Clearing existing data...')
    await db.delete(entries)
    await db.delete(habitTags)
    await db.delete(habits)
    await db.delete(tags)
    await db.delete(users)

    console.log('Creating a demo users...')
    const [demoUser] = await db
      .insert(users)
      .values({
        email: 'example@app.com',
        password: 'password123',
        firstName: 'Demo',
        lastName: 'User',
        username: 'demouser',
      })
      .returning()

    console.log('Creating Tags...')
    const [healthTag] = await db
      .insert(tags)
      .values({
        name: 'Health',
        color: '#f0f0f0',
      })
      .returning()

    console.log('Creating Habit...')
    const [exerciseHabit] = await db
      .insert(habits)
      .values({
        userId: demoUser.id,
        name: 'Exercise',
        description: 'Daily workout routine',
        frequency: 'daily',
        targetCount: 1,
      })
      .returning()

    await db.insert(habitTags).values({
      habitId: exerciseHabit.id,
      tagId: healthTag.id,
    })

    console.log('Adding completed Entries...')
    const today = new Date()
    today.setHours(12, 0, 0, 0)

    for (let i = 1; i <= 6; i++) {
      const entryDate = new Date(today)
      entryDate.setDate(today.getDate() - i)
      await db.insert(entries).values({
        habitId: exerciseHabit.id,
        completionDate: entryDate,
      })
    }

    console.log('✅ Database seed completed successfully!')
    console.log('You can log in with the following credentials:')
    console.log(`Email: ${demoUser.email}`)
    console.log(`Username: ${demoUser.username}`)
    console.log(`Password: ${demoUser.password}`)
  } catch (error) {
    console.error('Error during database seed:', error)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('Error executing seed script:', error)
      process.exit(1)
    })
}

export { seed }
