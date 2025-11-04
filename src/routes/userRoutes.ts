import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.ts'

const router = Router()

router.use(authenticateToken)

router.get('/', (req, res) => {
  res.json({ message: 'get all users' })
})

router.get('/:id', (req, res) => {
  res.json({ message: `get user with id: ${req.params.id}` })
})

router.put('/:id', (req, res) => {
  res.json({ message: `update user with id: ${req.params.id}` }).status(200)
})

router.post('/', (req, res) => {
  res.json({ message: 'create a user' }).status(201)
})

router.delete('/:id', (req, res) => {
  res.json({ message: `delete user with id: ${req.params.id}` }).status(202)
})

export default router
