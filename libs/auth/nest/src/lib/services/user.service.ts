import {
  AuthUserWithProviders,
  PrismaTransactionType,
} from '@js-monorepo/types'
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import {
  AuthUser,
  PrismaClient,
  Provider,
  UnRegisteredUser,
} from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { v4 as uuidv4 } from 'uuid'
import { AuthException } from '../exceptions/api-exception'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(@Inject('DB_CLIENT') private readonly dbClient: PrismaClient) {}

  async findAuthUserByEmail(email: string): Promise<AuthUserWithProviders> {
    try {
      const user = await this.dbClient.authUser.findUniqueOrThrow({
        where: { email: email },
        include: {
          providers: true,
        },
      })
      return user
    } catch (e) {
      this.logger.warn(`User not found with email: '${email}'`)
      throw new AuthException(
        HttpStatus.NOT_FOUND,
        `User doens't not exist with email: '${email}'`,
        'NOT_FOUND_USER_EXCEPTION'
      )
    }
  }

  async findAuthUserById(
    id: number,
    tr: PrismaClient | PrismaTransactionType = this.dbClient
  ): Promise<AuthUserWithProviders> {
    try {
      const user = await tr.authUser.findUniqueOrThrow({
        where: { id: id },
        include: {
          providers: true,
        },
      })
      return user
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
    authUserDTO: Omit<AuthUser, 'id' | 'createdAt' | 'roles'>,
    providerDTO: Omit<Provider, 'id' | 'userId'>
  ) {
    try {
      return await this.dbClient.$transaction(async (prisma) => {
        if (providerDTO) {
          return prisma.authUser.create({
            data: {
              email: authUserDTO.email,
              username: authUserDTO.username,
              providers: {
                create: {
                  type: providerDTO.type,
                  profileImage: providerDTO.profileImage,
                },
              },
            },
          })
        } else {
          return prisma.authUser.create({
            data: {
              email: authUserDTO.email,
              username: authUserDTO.username,
            },
          })
        }
      })
    } catch (err: any) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
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
        err
      )
      throw new AuthException(
        HttpStatus.BAD_REQUEST,
        'Something went wrong while creating user',
        'CREATE_USER_EXCEPTION'
      )
    }
  }

  async createUnRegisteredUser(
    unRegisteredUser: Omit<UnRegisteredUser, 'id' | 'createdAt' | 'token'>
  ): Promise<UnRegisteredUser> {
    try {
      const user = await this.dbClient.unRegisteredUser.upsert({
        where: { email: unRegisteredUser.email },
        update: {
          createdAt: new Date(),
          token: uuidv4(),
          providerEnum: unRegisteredUser.providerEnum,
          profileImage: unRegisteredUser.profileImage,
        },
        create: {
          email: unRegisteredUser.email,
          token: uuidv4(),
          providerEnum: unRegisteredUser.providerEnum,
          profileImage: unRegisteredUser.profileImage,
        },
      })
      this.logger.log(
        `Unregistered User: '${unRegisteredUser.email}' created successfully`
      )
      return user
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

  async findUnRegisteredUserByToken(token: string): Promise<UnRegisteredUser> {
    try {
      this.logger.debug(`Find Unregistered user with token: ${token}`)
      const unregisteredUser =
        await this.dbClient.unRegisteredUser.findUniqueOrThrow({
          where: { token: token },
        })
      return unregisteredUser
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
