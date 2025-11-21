import { type Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { users } from '../db/schema.ts'
import db from '../db/connection.ts'
import { eq, getTableColumns } from 'drizzle-orm'
import bcrypt from 'bcrypt'
import { hashPassword } from '../utils/passwords.ts'

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { password, ...rest } = getTableColumns(users)
    const allUsers = await db.select({ ...rest }).from(users)
    if (!users) {
      return res.status(404).json({ message: 'not users found!' })
    }

    res.status(200).json({ allUsers })
  } catch (error) {
    console.error('error getting all users: ', error)
    res.status(500).json({ message: 'Getting all users Failed!' })
  }
}

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))

    if (!user) {
      return res.status(404).json({ message: 'user not found!' })
    }

    res.status(200).json({
      user,
    })
  } catch (error) {
    console.error('error getting profile: ', error)
    res.status(500).json({ message: 'Failed to get user profile!' })
  }
}

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id
    const { email, username, firstName, lastName } = req.body

    const [updatedUser] = await db
      .update(users)
      .set({
        email,
        username,
        firstName,
        lastName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,

        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        updateAt: users.updatedAt,
        createdAt: users.createdAt,
      })

    if (!updatedUser) {
      return res.status(404).json({ message: 'user not found!' })
    }

    res.status(204).json({
      user: updatedUser,
    })
  } catch (error) {
    console.error('Failed to update user: ', error)
    res.status(500).json({ message: 'Failed to update user!' })
  }
}

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id
    const { oldPassword, newPassword } = req.body

    const [user] = await db.select().from(users).where(eq(users.id, userId))

    if (!user) {
      return res.status(404).json({ message: 'User not found!' })
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password)

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: 'Your old password is incorrect!' })
    }

    const newHashedPassword = await hashPassword(newPassword)

    await db
      .update(users)
      .set({
        password: newHashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning()

    res
      .status(201)
      .json({ message: 'your password has been updated successfully!' })
  } catch (error) {
    console.error('error while updating password: ', error)
    res.status(500).json({ message: 'Failed to update password!' })
  }
}
