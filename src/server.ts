import express from 'express'

const app = express()

app.get('/health', (req, res) => {
  res.json({ message: 'Server is healthy' }).status(200)
})

export { app }

export default app
