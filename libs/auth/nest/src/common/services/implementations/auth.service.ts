import { RegisterUserSchema } from '@js-monorepo/schemas'
import {
  AuthRole,
  AuthUserCreateDto,
  AuthUserDto,
  ProvidersDto,
  SessionUserType,
} from '@js-monorepo/types'
import { Transactional } from '@nestjs-cls/transactional'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import { AuthException } from '../../exceptions/api-exception'
import {
  ConstraintCode,
  ConstraintViolationException,
} from '../../exceptions/contraint-violation'
import { AuthRepository } from '../../repositories/auth.repository'
import { RepoAuth, ServiceRole } from '../../types'
import { AuthService } from '../interfaces/auth.service'
import { RolesService } from '../interfaces/roles.service'

@Injectable()
export class AuthServiceImpl implements AuthService {
  private readonly logger = new Logger(AuthServiceImpl.name)

  constructor(
    @Inject(RepoAuth) private readonly authRepository: AuthRepository,
    @Inject(ServiceRole) private readonly rolesService: RolesService
  ) {}

  async findAuthUserByEmail(email: string): Promise<AuthUserDto | null> {
    try {
      this.logger.debug(`Search user with email: '${email}'`)
      return await this.authRepository.findAuthUserByEmail(email)
    } catch (e) {
      this.logger.warn(`User not found with email: '${email}'`)
      return null
    }
  }

  async findAuthUserById(id: number): Promise<AuthUserDto | null> {
    try {
      this.logger.debug(`Search user with id: '${id}'`)
      return await this.authRepository.findAuthUserById(id)
    } catch (e) {
      this.logger.warn(`User not found with id: '${id}'`)
      return null
    }
  }

  @Transactional()
  async createAuthUser(
    authUserDTO: AuthUserCreateDto,
    providerDTO: ProvidersDto,
    roles: AuthRole[] = ['USER']
  ): Promise<AuthUserDto> {
    this.logger.debug(
      `Create auth user with username : '${authUserDTO?.username}'`
    )
    RegisterUserSchema.parse(authUserDTO)

    try {
      const roleIds = await this.getRoleIds(roles)
      return await this.authRepository.createAuthUser(
        authUserDTO,
        providerDTO,
        roleIds
      )
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
      } else if (err instanceof AuthException) {
        throw err
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

  createSessionUser(authUser: AuthUserDto): SessionUserType {
    return {
      id: authUser?.id,
      username: authUser?.username,
      roles: authUser?.userRole?.map((userRole) => userRole.role.name),
      createdAt: authUser?.createdAt,
      profile: {
        image: authUser?.userProfiles?.[0]?.profileImage,
        provider: authUser?.userProfiles?.[0]?.provider?.name,
      },
    }
  }

  private async getRoleIds(roles: AuthRole[]) {
    const roleIds = (await this.rolesService.getRolesByNames(roles))?.map(
      (role) => role.id
    )
    if (!roleIds?.length) {
      this.logger.error(`Invalid roles in database : ${roles?.join(', ')}`)
      throw new AuthException(
        HttpStatus.BAD_REQUEST,
        'Invalid roles',
        'CREATE_USER_EXCEPTION'
      )
    }
    return roleIds
  }
}
