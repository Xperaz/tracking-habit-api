import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.json({ message: 'get all habits' })
})

router.get('/:id', (req, res) => {
  res.json({ message: `get habit with id: ${req.params.id}` })
})

router.post('/', (req, res) => {
  res.json({ message: 'create a habit' }).status(2001)
})

router.delete('/:id', (req, res) => {
  res.json({ message: `delete habit with id: ${req.params.id}` }).status(202)
})

router.post('/:id', (req, res) => {
  res.json({ message: `complete habit: ${req.params.id}` }).status(201)
})

export default router
