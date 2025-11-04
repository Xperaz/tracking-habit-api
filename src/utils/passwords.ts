import bcrypt from 'bcrypt'
import env from '../../env.ts'

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS)
}

export const comparePasswords = async (
  plainPassword: string,
  hashedPassword: string
) => {
  return bcrypt.compare(plainPassword, hashedPassword)
}
