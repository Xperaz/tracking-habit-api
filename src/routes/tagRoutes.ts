import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.ts'
import {
  createTag,
  deleteTag,
  getAllTags,
  getTagById,
  updateTag,
} from '../controllers/tagController.ts'
import z from 'zod'
import { validateBody, validateParams } from '../middleware/validation.ts'

const createTagSchema = z.object({
  name: z.string(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
    .optional(),
})

const updateTagSchema = z.object({
  name: z.string().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
    .optional(),
})

const uuidSchema = z.object({
  id: z.string(),
})

const router = Router()

router.use(authenticateToken)

router.post('/', validateBody(createTagSchema), createTag)

router.get('/:id', validateParams(uuidSchema), getTagById)

router.get('/', getAllTags)

router.put(
  '/:id',
  validateBody(updateTagSchema),
  validateParams(uuidSchema),
  updateTag
)

router.delete('/:id', validateParams(uuidSchema), deleteTag)

export default router
