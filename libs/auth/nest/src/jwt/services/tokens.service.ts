import { decode, sign, verify } from '@js-monorepo/utils/jwt'
import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { AuthException } from '../../common/exceptions/api-exception'
import { AuthConfiguration } from '../types/auth.configuration'

@Injectable()
export class TokensService {
  constructor(
    @Inject('AUTH_OPTIONS') private readonly options: AuthConfiguration
  ) {}

  createJwtTokens(payload: any) {
    try {
      const accessToken = this.createAccessToken(payload)
      const refreshToken = this.createRefreshToken(payload)
      return {
        accessToken,
        refreshToken,
      }
    } catch (e) {
      throw new AuthException(
        HttpStatus.BAD_REQUEST,
        'CREATE_TOKEN',
        'CREATE_TOKEN'
      )
    }
  }

  createAccessToken(payload: any) {
    return sign(payload, '5min', this.options.accessTokenSecret) // 5 minutes
  }

  createRefreshToken(payload: any) {
    return sign(payload, '6h', this.options.refreshTokenSecret) // 6 hours
  }

  verifyAcessToken(token: any) {
    try {
      return verify(token, this.options.accessTokenSecret)
    } catch (e) {
      throw new AuthException(
        HttpStatus.UNAUTHORIZED,
        'UNAUTHORIZED',
        'UNAUTHORIZED'
      )
    }
  }

  verifyRefreshToken(token: any) {
    try {
      return verify(token, this.options.refreshTokenSecret)
    } catch (e) {
      throw new AuthException(
        HttpStatus.UNAUTHORIZED,
        'UNAUTHORIZED',
        'UNAUTHORIZED'
      )
    }
  }

  decode(token: any) {
    return decode(token) as any
  }
}
