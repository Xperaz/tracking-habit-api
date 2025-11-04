import { Router } from 'express'
import { validateBody, validateParams } from '../middleware/validation.ts'
import { object, z } from 'zod'
import { authenticateToken } from '../middleware/auth.ts'

const createHabitSchema = z.object({
  name: z.string(),
})

const completeParamsSchema = z.object({
  id: z.string(),
})

const router = Router()

router.use(authenticateToken)

router.get('/', (req, res) => {
  res.json({ message: 'get all habits' })
})

router.get('/:id', (req, res) => {
  res.json({ message: `get habit with id: ${req.params.id}` })
})

router.post('/', validateBody(createHabitSchema), (req, res) => {
  res.json({ message: 'create a habit' }).status(201)
})

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
