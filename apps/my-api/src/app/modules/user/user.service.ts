import { AuthSessionUserCacheService } from '@js-monorepo/auth/nest/session'
import { EditUserDto } from '@js-monorepo/types'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { UserRepo, UserRepository } from './user.repository'
import { ApiException } from '../../exceptions/api-exception'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(
    @Inject(UserRepo)
    private userRepo: UserRepository,
    private readonly authSessionUserCacheService: AuthSessionUserCacheService
  ) {}

  @Transactional()
  async handleUserUpdate(
    payload: EditUserDto,
    userId: number,
    profileId: number
  ) {
    try {
      await this.userRepo.editUser(payload, userId, profileId)
      await this.authSessionUserCacheService.invalidateAuthUserInCache(userId)
    } catch (e: any) {
      this.logger.error(
        `Error while editing user with id: ${userId} and profile id :${profileId}`
      )
      throw new ApiException(HttpStatus.BAD_REQUEST, 'ERROR_UPDATE_USER')
    }
  }
}
