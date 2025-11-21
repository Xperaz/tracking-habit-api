import { Router } from 'express'
import { validateBody, validateParams } from '../middleware/validation.ts'
import { object, z } from 'zod'
import { authenticateToken } from '../middleware/auth.ts'
import {
  createHabit,
  deleteHabit,
  getHabitById,
  getUserHabits,
  updateHabit,
} from '../controllers/habitController.ts'

const createHabitSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  frequency: z.string(),
  targetCount: z.number().optional(),
  tagIds: z.array(z.string()).optional(),
})

const updateHabitSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  frequency: z.string().optional(),
  targetCount: z.number().optional(),
  tagIds: z.array(z.string()).optional(),
})

const uuidSchema = z.object({
  id: z.string(),
})

const router = Router()

router.use(authenticateToken)

router.get('/', getUserHabits)

router.get('/:id', validateParams(uuidSchema), getHabitById)

router.post('/', validateBody(createHabitSchema), createHabit)

router.patch(
  '/:id',
  validateParams(uuidSchema),
  validateBody(updateHabitSchema),
  updateHabit
)

router.delete('/:id', validateParams(uuidSchema), deleteHabit)

router.post(
  '/:id/complete',
  validateParams(uuidSchema),
  validateBody(createHabitSchema),
  (req, res) => {
    res.json({ message: `complete habit: ${req.params.id}` }).status(201)
  }
)

export default router
