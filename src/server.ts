import express from 'express'
import authRoutes from './routes/authRoutes.ts'
import habitRoutes from './routes/habitRoutes.ts'
import userRoutes from './routes/userRoutes.ts'

const app = express()

app.get('/health', (req, res) => {
  res.json({ message: 'Server is healthy' }).status(200)
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/habits', habitRoutes)

export { app }

export default app
