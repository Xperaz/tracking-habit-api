import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.ts'
import z, { email } from 'zod'
import {
  changePassword,
  getAllUsers,
  getProfile,
  updateProfile,
} from '../controllers/userController.ts'
import { validateBody, validateParams } from '../middleware/validation.ts'

const updateProfileSchema = z.object({
  email: z.email('Invalid email format').optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username too long')
    .optional(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
})

const uuidSchema = z.object({
  id: z.string(),
})

const changePasswordSchema = z.object({
  oldPassword: z.string().min(7),
  newPassword: z.string().min(7),
})

const router = Router()

router.use(authenticateToken)

router.get('/', getAllUsers)

router.get('/:id', validateParams(uuidSchema), getProfile)

router.put('/:id', validateBody(updateProfileSchema), updateProfile)

router.post(
  '/change-password',
  validateBody(changePasswordSchema),
  changePassword
)

// TODO: delete to be added letter
router.delete('/:id', (req, res) => {
  res.json({ message: `delete user with id: ${req.params.id}` }).status(202)
})

export default router
