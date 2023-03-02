import { SetMetadata } from '@nestjs/common'

import { Role } from '@module/user/enum/role.enum'

export const ROLES_KEY = 'roles'
export const HasRoles = (...args: Role[]) => SetMetadata(ROLES_KEY, args)
