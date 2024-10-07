import { UserUpdateUserSchema } from '@js-monorepo/schemas'
import { AuthUserDto, AuthUserFullDto } from '@js-monorepo/types'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { AdminRepo } from '../types'
import { AdminRepository } from '../repositories/interfaces/admin.repository'
import { AuthUser } from '@prisma/client'
import { ApiException } from '../exceptions/api-exception'

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name)

  constructor(
    @Inject(AdminRepo)
    private adminRepository: AdminRepository
  ) {}

  async getUsers(
    page?: number,
    pageSize?: number
  ): Promise<{
    users: AuthUserFullDto[]
    totalCount: number
  }> {
    this.logger.debug(
      `Fetching user: page: '${page}' - pageSize: '${pageSize}'`
    )
    try {
      return await this.adminRepository.getUsers({
        page,
        pageSize,
      })
    } catch (e) {
      this.logger.error(
        `Error fetching user: page: '${page}' - pageSize: '${pageSize}'`,
        e.stack
      )
    }
    return {
      users: [],
      totalCount: 0,
    }
  }

  async updateUser(
    userId: number,
    updateUser: Omit<AuthUser, 'id' | 'email' | 'createdAt'>
  ): Promise<AuthUserDto> {
    this.logger.debug(`Updating User with id: '${userId}'`)
    UserUpdateUserSchema.parse(updateUser)
    try {
      return await this.adminRepository.updateUser(userId, updateUser)
    } catch (e) {
      this.logger.error(`Error Updating User with id: '${userId}'`, e.stack)
      throw new ApiException()
    }
  }

  getRoles() {
    return this.adminRepository.getRoles()
  }
}
