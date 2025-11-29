import { describe, test, expect, vi, beforeEach, type Mock } from 'vitest'

// mock db methods - use vi.hoisted so these are available when vi.mock is hoisted
const { mockUsersFindFirst, mockUsersFindMany } = vi.hoisted(() => ({
  mockUsersFindFirst: vi.fn(),
  mockUsersFindMany: vi.fn(),
}))

vi.mock('../../../src/db/connection', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
    query: {
      users: {
        findFirst: mockUsersFindFirst,
        findMany: mockUsersFindMany,
      },
    },
  },
}))

// mock utils
vi.mock('../../../src/utils/jwt', () => ({
  generateToken: vi.fn(),
}))

// mock password utils
vi.mock('../../../src/utils/passwords', () => ({
  hashPassword: vi.fn(),
  comparePasswords: vi.fn(),
}))

import { comparePasswords, hashPassword } from '../../../src/utils/passwords.ts'
import { db } from '../../../src/db/connection.ts'
import { login, register } from '../../../src/controllers/authController.ts'
import { generateToken } from '../../../src/utils/jwt.ts'

// mock request and response objects
const mockReq = (data: any) => data
const mockRes = () => {
  const res: any = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('Auth Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('register', () => {
    test('should register a new user successfully', async () => {
      const req = mockReq({
        body: {
          email: 'test@gmail.com',
          password: 'testuser',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
        },
      })

      const res = mockRes()

      ;(hashPassword as Mock).mockResolvedValue('hashedpassword123')
      ;(db.insert as Mock) = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: 'user-id-123',
              email: req.body.email,
              username: req.body.username,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              createdAt: new Date(),
            },
          ]),
        }),
      })

      const token = 'mocked-jwt-token'
      vi.mocked(generateToken).mockResolvedValue(token)

      await register(req, res)

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: expect.objectContaining({
          id: 'user-id-123',
          email: req.body.email,
          username: req.body.username,
        }),
        token,
      })
    })

    test('should handle errors during registration', async () => {
      const req = mockReq({
        body: {
          email: 'test@gmail.com',
          password: 'testuser',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
        },
      })

      const res = mockRes()

      ;(hashPassword as Mock).mockResolvedValue('hashedpassword123')
      ;(db.insert as Mock) = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error('DB error')),
        }),
      })

      await register(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create user' })
    })
  })

  describe('login', () => {
    test('should login a user successfully', async () => {
      const req = mockReq({
        body: {
          email: 'test@gmail.com',
          password: 'testuser',
        },
      })
      const res = mockRes()

      const mockedUser = {
        id: 'user-id-123',
        email: req.body.email,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        password: 'hashedpassword123',
      }

      mockUsersFindFirst.mockImplementation(async () => mockedUser)
      ;(comparePasswords as Mock).mockResolvedValue(true)
      ;(generateToken as Mock).mockResolvedValue('mocked-jwt-token')

      await login(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        user: expect.objectContaining({
          id: 'user-id-123',
          email: req.body.email,
          username: 'testuser',
        }),
        token: 'mocked-jwt-token',
      })
    })

    test('should handle invalid email/password during login', async () => {
      const req = mockReq({
        body: {
          email: 'test@gmail.com',
          password: 'wrongpassword',
        },
      })
      const res = mockRes()
      mockUsersFindFirst.mockImplementation(async () => null)

      await login(req, res)
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid email or password',
      })
    })

    test('should handle errors during login', async () => {
      const req = mockReq({
        body: {
          email: 'test@gmail.com',
          password: 'testuser',
        },
      })
      const res = mockRes()
      mockUsersFindFirst.mockImplementation(async () => {
        throw new Error('DB error')
      })

      await login(req, res)
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to login' })
    })
  })
})
