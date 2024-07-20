import {
  UnRegisteredUserCreateDto,
  UnRegisteredUserDto,
} from '@js-monorepo/types'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { AuthException } from '../../exceptions/api-exception'
import { UnregisteredRepository } from '../../repositories/unregistered.repository'
import { UnregisteredService } from '../interfaces/unregistered-user.service'

@Injectable()
export class UnregisteredServiceImpl implements UnregisteredService {
  private readonly logger = new Logger(UnregisteredServiceImpl.name)

  constructor(
    @Inject('UNREGISTERED_USER_REPOSITORY')
    private readonly unRegisteredRepository: UnregisteredRepository
  ) {}

  async createUnRegisteredUser(
    unRegisteredUser: UnRegisteredUserCreateDto
  ): Promise<UnRegisteredUserDto> {
    try {
      const newUnRegisteredUser =
        await this.unRegisteredRepository.createUnRegisteredUser(
          unRegisteredUser
        )

      this.logger.log(
        `Unregistered User: '${newUnRegisteredUser.email}' created successfully`
      )
      return newUnRegisteredUser
    } catch (err) {
      this.logger.error(
        `There was an error with user: ${unRegisteredUser.email}`,
        err
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
    } catch (e) {
      this.logger.error(
        `Error in finding Unregistered user with token: ${token}`,
        e
      )
      throw new AuthException(
        HttpStatus.BAD_REQUEST,
        'Invalid token!',
        'INVALID_TOKEN_EXCEPTION'
      )
    }
  }
}
