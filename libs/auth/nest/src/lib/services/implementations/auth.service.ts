import {
  AuthUserCreateDto,
  AuthUserDto,
  AuthUserWithProvidersDto,
  ProvidersDto,
} from '@js-monorepo/types'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { AuthException } from '../../exceptions/api-exception'
import {
  ConstraintCode,
  ConstraintViolationException,
} from '../../exceptions/contraint-violation'
import { AuthRepository } from '../../repositories/auth.repository'
import { AuthService } from '../interfaces/auth.service'

@Injectable()
export class AuthServiceImpl implements AuthService {
  private readonly logger = new Logger(AuthServiceImpl.name)

  constructor(
    @Inject('AUTH_REPOSITORY') private readonly authRepository: AuthRepository
  ) {}

  async findAuthUserByEmail(email: string): Promise<AuthUserWithProvidersDto> {
    try {
      return await this.authRepository.findAuthUserByEmail(email)
    } catch (e) {
      this.logger.warn(`User not found with email: '${email}'`)
      throw new AuthException(
        HttpStatus.NOT_FOUND,
        `User doens't not exist with email: '${email}'`,
        'NOT_FOUND_USER_EXCEPTION'
      )
    }
  }

  async findAuthUserById(id: number): Promise<AuthUserWithProvidersDto> {
    try {
      return await this.authRepository.findAuthUserById(id)
    } catch (e) {
      this.logger.warn(`User not found with id: '${id}'`)
      throw new AuthException(
        HttpStatus.NOT_FOUND,
        `User doens't not exist with id: '${id}'`,
        'NOT_FOUND_USER_EXCEPTION'
      )
    }
  }

  async createAuthUser(
    authUserDTO: AuthUserCreateDto,
    providerDTO: ProvidersDto
  ): Promise<AuthUserDto> {
    try {
      return await this.authRepository.createAuthUser(authUserDTO, providerDTO)
    } catch (err: any) {
      if (err instanceof ConstraintViolationException) {
        if (err.code === ConstraintCode.USERNAME_EXISTS) {
          this.logger.warn(`Username: '${authUserDTO.username}' already exists`)
          throw new AuthException(
            HttpStatus.BAD_REQUEST,
            'Username already exists',
            'USERNAME_EXISTS'
          )
        }
      }
      this.logger.error(
        `There was an error when creating a user with username: ${authUserDTO.username}`,
        err.stack
      )
      throw new AuthException(
        HttpStatus.BAD_REQUEST,
        'Something went wrong while creating user',
        'CREATE_USER_EXCEPTION'
      )
    }
  }
}
