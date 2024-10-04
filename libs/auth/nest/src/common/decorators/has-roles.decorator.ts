import { SetMetadata } from '@nestjs/common'
import { RolesEnum } from '../types'

export const HasRoles = (...roles: RolesEnum[]) => SetMetadata('roles', roles)
