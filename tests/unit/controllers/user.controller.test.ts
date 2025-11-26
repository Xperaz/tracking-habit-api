import { describe, test, expect, vi, beforeEach, type Mock } from 'vitest'

// mock db methods
vi.mock('../../../src/db/connection', () => ({
  default: {
    select: vi.fn(),
    update: vi.fn(),
  },
}))

// mock bcrypt
vi.mock('bcrypt', () => ({
  default: {
    compare: vi.fn(),
  },
}))

// mock hashing function
vi.mock('../../../src/utils/passwords', () => ({
  hashPassword: vi.fn(),
}))

// imports after mocks
import db from '../../../src/db/connection.ts'
import bcrypt from 'bcrypt'
import { hashPassword } from '../../../src/utils/passwords.ts'
import {
  changePassword,
  getAllUsers,
  getProfile,
  updateProfile,
} from '../../../src/controllers/userController.ts'
import type { AuthenticatedRequest } from '../../../src/middleware/auth.ts'

const mockReq = (data: AuthenticatedRequest) => data
const mockRes = () => {
  const res: any = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('get all users controller - unit test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should return all users successfully', async () => {
    const res = mockRes()
    const req = mockReq({} as unknown as AuthenticatedRequest)

    // mock DB chain: db.select(...).from()
    ;(db.select as any) = vi.fn().mockReturnValue({
      from: vi.fn().mockResolvedValue([
        { id: '1', name: 'John' },
        { id: '2', name: 'Jane' },
      ]),
    })

    await getAllUsers(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      allUsers: [
        { id: '1', name: 'John' },
        { id: '2', name: 'Jane' },
      ],
    })
  })

  test('return 404 if not user found', async () => {
    const res = mockRes()
    const req = mockReq({} as unknown as AuthenticatedRequest)

    ;(db.select as Mock) = vi.fn().mockReturnValue({
      from: vi.fn().mockResolvedValue([]),
    })

    await getAllUsers(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      message: 'not users found!',
    })
  })

  test('should throw and exception if there is an error', async () => {
    const req = mockReq({} as unknown as AuthenticatedRequest)
    const res = mockRes()

    ;(db.select as Mock) = vi.fn().mockReturnValue({
      from: vi.fn().mockRejectedValue(new Error('DB error')),
    })

    await getAllUsers(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Getting all users Failed!',
    })
  })
})

describe('get profile controller - unit test', async () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('get profile info successfully', async () => {
    const req = mockReq({
      user: { id: '1', email: 'test@gmail.com', username: 'testuser' },
    } as unknown as AuthenticatedRequest)

    const res = mockRes()

    const mockUser = {
      id: '1',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@gmail.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    ;(db.select as Mock) = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([mockUser]),
      }),
    })

    await getProfile(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      user: mockUser,
    })
  })

  test('should return 404 if user not found', async () => {
    const req = mockReq({
      user: { id: '1', email: 'test@gmail.com', username: 'testuser' },
    } as unknown as AuthenticatedRequest)

    const res = mockRes()

    ;(db.select as Mock) = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    })

    await getProfile(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      message: 'user not found!',
    })
  })

  test('should throw error on exception', async () => {
    const req = mockReq({
      user: { id: '1', email: 'test@gmail.com', username: 'testuser' },
    } as unknown as AuthenticatedRequest)

    const res = mockRes()
    ;(db.select as Mock) = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockRejectedValue(new Error('DB error')),
      }),
    })

    await getProfile(req, res)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Failed to get user profile!',
    })
  })
})

describe('update profile controller - unit test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should update profile successfully', async () => {
    const req = mockReq({
      user: { id: '1', email: 'test@gmail.com', username: 'testuser' },
      body: {
        email: 'test@gmail.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      },
    } as unknown as AuthenticatedRequest)

    const res = mockRes()

    const mockUpdatedUser = {
      id: '1',
      email: 'test@mail.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      updatedAt: new Date(),
      createdAt: new Date(),
    }

    ;(db.update as Mock) = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockUpdatedUser]),
        }),
      }),
    })

    await updateProfile(req, res)

    expect(db.update).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.json).toHaveBeenCalledWith({
      user: mockUpdatedUser,
    })
  })

  test('should return 404 if user to update not found', async () => {
    const req = mockReq({
      user: { id: '1', email: 'test@gmail.com', username: 'testuser' },
      body: {
        email: 'test@gmail.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      },
    } as unknown as AuthenticatedRequest)

    const res = mockRes()
    ;(db.update as Mock) = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    })

    await updateProfile(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      message: 'user not found!',
    })
  })

  test('should throw error on exception', async () => {
    const req = mockReq({
      user: { id: '1', email: 'test@gmail.com', username: 'testuser' },
      body: {
        email: 'test@gmail.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      },
    } as unknown as AuthenticatedRequest)
    const res = mockRes()

    ;(db.update as Mock) = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error('DB error')),
        }),
      }),
    })

    await updateProfile(req, res)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Failed to update user!',
    })
  })
})

describe('changePassword controller - unit test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("should update the user's password when oldPassword is correct", async () => {
    const req = mockReq({
      user: { id: '1', email: 'test@gmail.com', username: 'testuser' },
      body: {
        oldPassword: 'old123',
        newPassword: 'new123',
      },
    } as unknown as AuthenticatedRequest)

    const res = mockRes()

    ;(db.select as Mock).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi
          .fn()
          .mockResolvedValue([{ id: '1', password: 'hashed_old_pw' }]),
      }),
    })
    ;(bcrypt.compare as Mock).mockResolvedValue(true)
    ;(hashPassword as Mock).mockResolvedValue('hashed_new_pw')
    ;(db.update as Mock).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{}]),
        }),
      }),
    })

    await changePassword(req, res)

    expect(bcrypt.compare).toHaveBeenCalledWith('old123', 'hashed_old_pw')
    expect(hashPassword).toHaveBeenCalledWith('new123')
    expect(db.update).toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({
      message: 'your password has been updated successfully!',
    })
  })

  test('should return 401 if oldPassword is incorrect', async () => {
    const req = mockReq({
      user: { id: '1', email: 'test@gmail.com', username: 'testuser' },
      body: {
        oldPassword: 'wrong_old',
        newPassword: 'new123',
      },
    } as unknown as AuthenticatedRequest)

    const res = mockRes()

    // mock DB: user exists
    ;(db.select as Mock).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi
          .fn()
          .mockResolvedValue([{ id: '1', password: 'hashed_old_pw' }]),
      }),
    })

    // mock bcrypt: old password does not match
    ;(bcrypt.compare as Mock).mockResolvedValue(false)
    await changePassword(req, res)

    expect(bcrypt.compare).toHaveBeenCalledWith('wrong_old', 'hashed_old_pw')
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Your old password is incorrect!',
    })
  })

  test('should return 404 if user not found in DB', async () => {
    const req = mockReq({
      user: { id: '2', email: 'test@gmail.com', username: 'testuser' },
      body: {
        oldPassword: 'old123',
        newPassword: 'new123',
      },
    } as unknown as AuthenticatedRequest)

    const res = mockRes()
    // mock DB: user does not exist
    ;(db.select as Mock).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    })

    await changePassword(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found!' })
  })

  test('Throw error on exception', async () => {
    const req = mockReq({
      user: { id: '2', email: 'test@gmail.com', username: 'testuser' },
      body: {
        oldPassword: 'old123',
        newPassword: 'new123',
      },
    } as unknown as AuthenticatedRequest)

    const res = mockRes()

    ;(db.select as Mock).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockRejectedValue(new Error('DB error')),
      }),
    })

    await changePassword(req, res)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      message: 'Failed to update password!',
    })
  })
})
