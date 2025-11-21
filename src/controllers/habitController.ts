import { type Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { db } from '../db/connection.ts'
import { habits, entries, habitTags, tags } from '../db/schema.ts'
import { and, eq, inArray, desc } from 'drizzle-orm'

export const createHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, frequency, targetCount, tagIds } = req.body

    const result = await db.transaction(async (tx) => {
      const [newHabit] = await tx
        .insert(habits)
        .values({
          userId: req.user.id,
          name,
          description,
          frequency,
          targetCount,
        })
        .returning()

      if (tagIds && tagIds.length > 0) {
        const habitTagValues = tagIds.map((tagId: number) => ({
          habitId: newHabit.id,
          tagId,
        }))

        await tx.insert(habitTags).values(habitTagValues)
      }

      return newHabit
    })
    res.status(201).json({
      message: 'Habit created successfully',
      habit: result,
    })
  } catch (error) {
    console.error('Error creating habit:', error)
    res.status(500).json({ message: 'Failed to create habit' })
  }
}

export const getUserHabits = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userHabitsWithTags = await db.query.habits.findMany({
      where: eq(habits.userId, req.user.id),
      with: {
        habitTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: [desc(habits.createdAt)],
    })

    const habitsWithTags = userHabitsWithTags.map((habit) => ({
      ...habit,
      tags: habit.habitTags.map((ht) => ht.tag),
      habitTags: undefined,
    }))

    res.status(200).json({
      message: 'User habits retrieved successfully',
      habits: habitsWithTags,
    })
  } catch (error) {
    console.error('get habits error: ', error)
    res.status(500).json({ message: 'Failed to get habits' })
  }
}

export const updateHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id
    const { tagIds, ...updates } = req.body

    const result = await db.transaction(async (tx) => {
      const [updatedHabit] = await tx
        .update(habits)
        .set({ ...updates, updateAt: new Date() })
        .where(and(eq(habits.id, id), eq(habits.userId, req.user.id)))
        .returning()
      if (!updateHabit) {
        return res.status(401).end()
      }

      if (tagIds) {
        await tx.delete(habitTags).where(eq(habitTags.habitId, id))

        if (tagIds.length > 0) {
          const habitTagValues = tagIds.map((tagId: number) => ({
            habitId: id,
            tagId,
          }))
          await tx.insert(habitTags).values(habitTagValues)
        }
      }

      return updatedHabit
    })

    res.status(200).json({
      message: 'Habit updated successfully',
      habit: result,
    })
  } catch (error) {
    console.error('update habit error: ', error)
    res.status(500).json({ message: 'Failed to update habit' })
  }
}

export const deleteHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id
    const userId = req.user!.id

    const [habit] = await db
      .delete(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning()

    if (!habit) {
      return res.status(404).json({ message: 'habit not found' })
    }

    return res.status(200).json({ message: 'habit successfully deleted' })
  } catch (error) {
    console.error(`error deleting habit: `, error)
    return res.status(500).json({ message: 'Failed to delete habit' })
  }
}

export const getHabitById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = req.params.id
    if (!id) {
      return res.status(400).json({ message: 'Habit ID is required' })
    }
    const habit = await db.query.habits.findFirst({
      where: eq(habits.id, id),
      with: {
        habitTags: {
          with: {
            tag: true,
          },
        },
      },
    })

    res.status(200).json({
      habit,
    })
  } catch (error) {
    console.error('get habit by id error: ', error)
    res.status(500).json({ message: 'Failed to get habit by id' })
  }
}
