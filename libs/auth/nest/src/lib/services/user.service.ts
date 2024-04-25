import { AuthUserWithProviders } from '@js-monorepo/types'
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
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prismaClient: PrismaClient
  ) {}

  async findAuthUserByEmail(email: string): Promise<AuthUserWithProviders> {
    try {
      return await this.prismaClient.authUser.findUniqueOrThrow({
        where: { email: email },
        include: {
          providers: true,
        },
      })
    } catch (e) {
      Logger.warn(`User not found with email: '${email}'`)
      throw new AuthException(
        HttpStatus.NOT_FOUND,
        `User doens't not exist with email: '${email}'`,
        'NOT_FOUND_USER_EXCEPTION'
      )
    }
  }

  async createAuthUser(
    authUserDTO: Omit<AuthUser, 'id' | 'createdAt' | 'roles'>,
    providerDTO: Omit<Provider, 'id' | 'userId'>
  ) {
    try {
      return await this.prismaClient.$transaction(async (prisma) => {
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
          Logger.warn(`Username: '${authUserDTO.username}' already exists`)
          throw new AuthException(
            HttpStatus.BAD_REQUEST,
            'Username already exists'
          )
        }
      }
      Logger.error(
        err,
        `There was an error when creating a user with username: ${authUserDTO.username}`
      )
      throw new AuthException(HttpStatus.BAD_REQUEST, 'CREATE_USER_EXCEPTION')
    }
  }

  async createUnRegisteredUser(
    unRegisteredUser: Omit<UnRegisteredUser, 'id' | 'createdAt' | 'token'>
  ): Promise<UnRegisteredUser> {
    try {
      const user = await this.prismaClient.unRegisteredUser.upsert({
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
      Logger.log(
        `Unregistered User: '${unRegisteredUser.email}' created successfully`
      )
      return user
    } catch (err) {
      Logger.error(
        err,
        `There was an error with user: ${unRegisteredUser.email}`
      )
    }
    throw new AuthException(
      HttpStatus.BAD_REQUEST,
      'CREATE_UNREGISTERED_USER_EXCEPTION'
    )
  }

  async findUnRegisteredUserByToken(token: string): Promise<UnRegisteredUser> {
    try {
      return await this.prismaClient.unRegisteredUser.findUniqueOrThrow({
        where: { token: token },
      })
    } catch (e) {
      throw new AuthException(HttpStatus.BAD_REQUEST, 'INVALID_TOKEN_EXCEPTION')
    }
  }

  async createProvider(provider: Omit<Provider, 'id'>): Promise<Provider> {
    try {
      return await this.prismaClient.provider.create({
        data: {
          ...provider,
        },
      })
    } catch (err) {
      Logger.error(err, `There was an error with provider: ${provider.type}`)
      throw new AuthException(
        HttpStatus.BAD_REQUEST,
        'CREATE_PROVIDER_EXCEPTION'
      )
    }
  }
}
