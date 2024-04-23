import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { VerifyCallback } from 'jsonwebtoken'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject('JWT_SECRET') private readonly jwtSecret: string) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
    })
  }

  async validate(payload: any, done: VerifyCallback) {
    try {
      done(null, payload)
    } catch (err) {
      throw new UnauthorizedException('unauthorized')
    }
  }
}
