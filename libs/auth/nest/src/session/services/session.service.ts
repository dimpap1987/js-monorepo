import { Transactional } from '@nestjs-cls/transactional'
import { Inject, Injectable } from '@nestjs/common'
import { AuthService } from '../../common/services/interfaces/auth.service'
import { UnregisteredService } from '../../common/services/interfaces/unregistered-user.service'
import { ServiceAuth, ServiceUnRegisteredUser } from '../../common/types'

@Injectable()
export class SessionService {
  constructor(
    @Inject(ServiceAuth) private authService: AuthService,
    @Inject(ServiceUnRegisteredUser)
    private unRegisteredUserService: UnregisteredService
  ) {}

  @Transactional()
  async handleRegister(token: string, username: string) {
    const unregisteredUser = await this.unRegisteredUserService.findUnRegisteredUserByToken(token)

    return this.authService.createAuthUser(
      {
        email: unregisteredUser.email,
        username: username,
      },
      {
        id: unregisteredUser.providerId,
        profileImage: unregisteredUser.profileImage,
      }
    )
  }

  async findUnRegisteredUserByToken(token: string) {
    return this.unRegisteredUserService.findUnRegisteredUserByToken(token)
  }
}
