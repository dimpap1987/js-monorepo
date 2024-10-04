import { CreateUnregisteredUserSchema } from '@js-monorepo/schemas'
import {
  UnRegisteredUserCreateDto,
  UnRegisteredUserDto,
} from '@js-monorepo/types'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { AuthException } from '../../exceptions/api-exception'
import { UnregisteredRepository } from '../../repositories/unregistered.repository'
import { RepoUnRegisteredUser } from '../../types'
import { UnregisteredService } from '../interfaces/unregistered-user.service'

@Injectable()
export class UnregisteredServiceImpl implements UnregisteredService {
  private readonly logger = new Logger(UnregisteredServiceImpl.name)

  constructor(
    @Inject(RepoUnRegisteredUser)
    private readonly unRegisteredRepository: UnregisteredRepository
  ) {}

  async createUnRegisteredUser(
    unRegisteredUser: UnRegisteredUserCreateDto
  ): Promise<UnRegisteredUserDto> {
    CreateUnregisteredUserSchema.parse(unRegisteredUser)
    try {
      const newUnRegisteredUser =
        await this.unRegisteredRepository.createUnRegisteredUser(
          unRegisteredUser
        )

      this.logger.log(
        `Unregistered User: '${newUnRegisteredUser.email}' created successfully`
      )
      return newUnRegisteredUser
    } catch (err: any) {
      this.logger.error(
        `There was an error with user: ${unRegisteredUser.email}`,
        err.stack
      )
      throw new AuthException(
        HttpStatus.BAD_REQUEST,
        'Something went wrong while creating unregistered user',
        'CREATE_UNREGISTERED_USER_EXCEPTION'
      )
    }
  }

  async findUnRegisteredUserByToken(
    token: string
  ): Promise<UnRegisteredUserDto> {
    try {
      this.logger.debug(`Find Unregistered user with token: ${token}`)
      return await this.unRegisteredRepository.findUnRegisteredUserByToken(
        token
      )
    } catch (e: any) {
      this.logger.error(
        `Error in finding Unregistered user with token: ${token}`,
        e.stack
      )
      throw new AuthException(
        HttpStatus.BAD_REQUEST,
        'Invalid token!',
        'INVALID_TOKEN_EXCEPTION'
      )
    }
  }
}
