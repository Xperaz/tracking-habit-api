import { SignJWT } from 'jose'
import { createSecretKey } from 'crypto'
import env from '../../env.ts'

export interface JwtPayload {
  id: string
  email: string
  username: string
  [key: string]: unknown
}

export const generateToken = (payload: JwtPayload) => {
  const secret = env.JWT_SECRET
  const secretKey = createSecretKey(secret, 'utf-8')

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(env.JWT_EXPIRES_IN || '7d')
    .setIssuedAt()
    .sign(secretKey)
}
