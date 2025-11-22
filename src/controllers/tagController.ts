import { and, eq } from 'drizzle-orm'
import db from '../db/connection.ts'
import { tags, users } from '../db/schema.ts'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import type { Response } from 'express'

export const createTag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, color } = req.body

    // check if tag exist
    const existingTag = await db.query.tags.findFirst({
      where: eq(tags.name, name),
    })

    if (existingTag) {
      return res
        .status(409)
        .json({ message: 'A tag with this name already exist' })
    }

    const [newTag] = await db
      .insert(tags)
      .values({
        name,
        color: color || '#6B7280',
      })
      .returning()

    res.status(201).json({
      newTag,
    })
  } catch (error) {
    console.log('Error while creating tag: ', error)
    res.status(500).json({ message: 'Failed to create a tag' })
  }
}

export const getTagById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tagId = req.params.id

    const tag = await db.query.tags.findFirst({
      where: eq(tags.id, tagId),
      with: {
        habitTags: {
          with: {
            habit: {
              columns: {
                id: true,
                name: true,
                description: true,
                isActive: true,
              },
            },
          },
        },
      },
    })

    if (!tag) {
      return res.status(404).json({ message: 'Tag not found!' })
    }

    const tagWithHabits = {
      ...tag,
      habits: tag.habitTags.map((ht) => ht.habit),
      habitTags: undefined,
    }

    res.status(200).json({
      tagWithHabits,
    })
  } catch (error) {
    console.error('Error while getting a tag: ', error)
    res.status(500).json({
      message: 'Failed to get a tag',
    })
  }
}

export const getAllTags = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allTags = await db.select().from(tags).orderBy(tags.name)

    if (!allTags) {
      return res.status(404).json({ message: 'Not tags found' })
    }

    res.status(200).json({ allTags })
  } catch (error) {
    console.error('error get tags: ', error)
    res.status(500).json({ message: 'Failed to get tags' })
  }
}

export const updateTag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, color } = req.body
    const tagId = req.params.id

    if (name) {
      const existingTag = await db.query.tags.findFirst({
        where: eq(tags.name, name),
      })

      if (existingTag) {
        return res
          .status(409)
          .json({ message: 'Tag with this name already exist' })
      }
    }

    const updatedTag = await db
      .update(tags)
      .set({
        name: name || tags.name,
        color: color || tags.color,
        updatedAt: new Date(),
      })
      .where(eq(tags.id, tagId))
      .returning()

    if (!updatedTag) {
      return res.status(404).json({ error: 'Tag not found' })
    }

    res.status(201).json({
      message: 'Tag updated successfully',
      tag: updatedTag,
    })
  } catch (error) {
    console.error('error updating tag: ', error)
    res.status(500).json({ message: 'Failed to update tag' })
  }
}

export const deleteTag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tagId = req.params.id

    const [deletedTag] = await db
      .delete(tags)
      .where(eq(tags.id, tagId))
      .returning()

    if (!deletedTag) {
      return res.status(404).json({ message: 'Tag not found!' })
    }

    res.status(200).json({ message: 'Tag was deleted successfully' })
  } catch (error) {
    console.error('Error while deleting: ', error)
    res.status(500).json({ message: 'Failed to delete' })
  }
}
