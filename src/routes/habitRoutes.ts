import { Router } from 'express'
import { validateBody, validateParams } from '../middleware/validation.ts'
import { object, z } from 'zod'
import { authenticateToken } from '../middleware/auth.ts'
import {
  createHabit,
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

const completeParamsSchema = z.object({
  id: z.string(),
})

const router = Router()

router.use(authenticateToken)

router.get('/', getUserHabits)

router.get('/:id', (req, res) => {
  res.json({ message: `get habit with id: ${req.params.id}` })
})

router.post('/', validateBody(createHabitSchema), createHabit)
router.patch('/:id', validateBody(updateHabitSchema), updateHabit)

router.delete('/:id', (req, res) => {
  res.json({ message: `delete habit with id: ${req.params.id}` }).status(202)
})

router.post(
  '/:id/complete',
  validateParams(completeParamsSchema),
  validateBody(createHabitSchema),
  (req, res) => {
    res.json({ message: `complete habit: ${req.params.id}` }).status(201)
  }
)

export default router
