import { decode, sign, verify } from '@js-monorepo/utils'
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { JwtPayload } from 'jsonwebtoken'

@Injectable()
export class AuthService {
  constructor(@Inject('JWT_SECRET') private readonly jwtSecret: string) {}

  createJwtTokens(payload: any) {
    try {
      const accessToken = this.createAccessToken(payload)
      const refreshToken = this.createRefreshToken(payload)
      return {
        accessToken,
        refreshToken,
      }
    } catch (e) {
      throw new HttpException('CREATE_TOKEN', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  createAccessToken(payload: any) {
    return sign(payload, 300 * 5, this.jwtSecret) // 5 minutes
  }

  createRefreshToken(payload: JwtPayload) {
    return sign(payload, 86400 * 10, this.jwtSecret) // 10 day
  }

  verify(token: any) {
    try {
      return verify(token, this.jwtSecret) as JwtPayload
    } catch (e) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED)
    }
  }

  handleSessionRequest(bearerToken: string) {
    const { user } = this.verify(bearerToken)
    return {
      user,
    }
  }

  decode(token: any) {
    return decode(token) as JwtPayload
  }
}
