import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.ts'
import {
  createTag,
  getAllTags,
  getTagById,
} from '../controllers/tagController.ts'
import z from 'zod'
import { validateBody, validateParams } from '../middleware/validation.ts'

const createTagSchema = z.object({
  name: z.string(),
  color: z.string().optional,
})

const uuidSchema = z.object({
  id: z.string(),
})

const router = Router()

router.use(authenticateToken)

router.post('/', validateBody(createTagSchema), createTag)

router.get('/:id', validateParams(uuidSchema), getTagById)

router.get('/', getAllTags)

export default router
