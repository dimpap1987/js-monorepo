import { AuthUserDto, AuthUserFullDto } from '@js-monorepo/types'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { AuthUser } from '@prisma/client'
import { AdminRepository } from '../repositories/interfaces/admin.repository'

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name)

  constructor(
    @Inject('ADMIN_REPOSITORY')
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
    try {
      return await this.adminRepository.updateUser(userId, updateUser)
    } catch (e) {
      this.logger.error(`Error Updating User with id: '${userId}'`, e.stack)
    }
  }
}
