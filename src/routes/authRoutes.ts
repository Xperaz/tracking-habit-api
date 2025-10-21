import { Router } from 'express'

const router = Router()

router.post('/register', (req, res) => {
  res.status(201).json({ message: 'User registered successfully' })
})

router.post('/login', (req, res) => {
  res.status(201).json({ message: 'user logged in' })
})

export default router
