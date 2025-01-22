import { decode as jsonDecode, sign as jsonSign, verify as jsonVerify } from 'jsonwebtoken'

export class JwtError extends Error {
  errorCode: keyof typeof JwtError.CODE

  static CODE = Object.freeze({
    UNAUTHORIZED: 'UNAUTHORIZED' as const,
    SIGN_ERROR: 'SIGN_ERROR' as const,
    INTERNAL: 'INTERNAL' as const,
  })

  constructor(msg?: string, errorCode: keyof typeof JwtError.CODE = JwtError.CODE.INTERNAL) {
    super(msg)
    this.errorCode = errorCode
  }
}

export function verify(token: string, secret: string) {
  try {
    return jsonVerify(token, secret)
  } catch (e) {
    throw new JwtError('Not authorized!', JwtError.CODE.UNAUTHORIZED)
  }
}

export function sign(payload: any, expiry: number | string, secret: string) {
  try {
    return jsonSign(payload, secret, {
      expiresIn: expiry,
    })
  } catch (err) {
    throw new JwtError(JwtError.CODE.SIGN_ERROR)
  }
}

export function decode(token: string) {
  return jsonDecode(token, { complete: false })
}
