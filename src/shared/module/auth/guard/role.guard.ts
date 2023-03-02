import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { Role } from '@module/user/enum/role.enum'
import { User } from '@module/user/model/user.entity'

import { ROLES_KEY } from '@shared/decorator/role.decorator'
import { getUserFromHeader } from '@shared/util/api.util'

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  matchRoles = (roles: Role[], userRole: Role) => roles.includes(userRole)

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()])
    if (!roles) return true

    const user: User = getUserFromHeader(context)
    if (user.role === Role.ADMIN) return true

    return this.matchRoles(roles, user.role)
  }
}
