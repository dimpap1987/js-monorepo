import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common'
import {
  AuthUser,
  PrismaClient,
  Provider,
  UnRegisteredUser,
} from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { AuthException } from '../exceptions/api-exception'

@Injectable()
export class UserService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prismaClient: PrismaClient
  ) {}

  async findAuthUserByEmail(email: string) {
    try {
      return await this.prismaClient.authUser.findUniqueOrThrow({
        where: { email: email },
        include: {
          providers: true,
        },
      })
    } catch (e) {
      Logger.warn(`User not found with email: '${email}'`)
      return Promise.resolve(null)
    }
  }

  async createAuthUser(
    authUserDTO: Omit<AuthUser, 'id' | 'createdAt' | 'roles'>
  ) {
    try {
      const user = await this.prismaClient.authUser.create({
        data: {
          ...authUserDTO,
        },
      })
      Logger.log(`New User: '${authUserDTO.username}' created successfully`)
      return user
    } catch (err) {
      Logger.error(err, `There was an error with user: ${authUserDTO.username}`)
      throw new AuthException(HttpStatus.BAD_REQUEST, 'CREATE USER EXCEPTION')
    }
  }

  async createUnRegisteredUser(
    unRegisteredUser: Omit<UnRegisteredUser, 'id' | 'createdAt' | 'token'>
  ) {
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
      'CREATE UNREGISTERED_USER EXCEPTION'
    )
  }

  async findUnRegisteredUserByToken(token: string) {
    try {
      return await this.prismaClient.unRegisteredUser.findUniqueOrThrow({
        where: { token: token },
      })
    } catch (e) {
      throw new AuthException(HttpStatus.BAD_REQUEST, 'Invalid token')
    }
  }

  async createProvider(provider: Omit<Provider, 'id'>) {
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
        'CREATE PROVIDER EXCEPTION'
      )
    }
  }
}
