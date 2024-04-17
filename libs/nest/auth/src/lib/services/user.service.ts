import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'
import {
  AuthUser,
  PrismaClient,
  Provider,
  UnRegisteredUser,
} from '@prisma/client'
import { RolesEnum } from '../types/auth.configuration'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class UserService {
  constructor(
    @Inject('PRISMA_CLIENT') private readonly prismaClient: PrismaClient
  ) {}

  async findAuthUserByEmail(email: string) {
    Logger.debug(`find user with email: '${email}'`)
    try {
      return await this.prismaClient.authUser.findFirstOrThrow({
        where: { email: email },
      })
    } catch (e) {
      Logger.warn(`User not found with email: '${email}'`)
      return null
    }
  }

  async createAuthUser(authUserDTO: Omit<AuthUser, 'id' | 'createdAt'>) {
    try {
      const user = await this.prismaClient.authUser.create({
        data: {
          email: authUserDTO.email,
          username: authUserDTO.username,
          roles: [RolesEnum.USER],
        },
      })
      Logger.log(`New User: '${authUserDTO.username}' created successfully`)
      return user
    } catch (err) {
      Logger.error(err, `There was an error with user: ${authUserDTO.username}`)
    }
    return null
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
          provider: unRegisteredUser.provider,
        },
        create: {
          email: unRegisteredUser.email,
          token: uuidv4(),
          provider: unRegisteredUser.provider,
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
    return null
  }

  async findUnRegisteredUserByToken(token: string) {
    try {
      return await this.prismaClient.unRegisteredUser.findFirstOrThrow({
        where: { token: token },
      })
    } catch (e) {
      throw new HttpException('NOT_FOUND', HttpStatus.NOT_FOUND)
    }
  }
}
