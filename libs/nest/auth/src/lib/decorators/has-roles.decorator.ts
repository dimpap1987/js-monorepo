import { SetMetadata } from '@nestjs/common'
import { RolesEnum } from '../types/auth.configuration'

export const HasRoles = (...roles: RolesEnum[]) => SetMetadata('roles', roles)
