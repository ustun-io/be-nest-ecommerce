import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { UpdateUserInput } from '@module/user/dto/update-user.input'
import { Role } from '@module/user/enum/role.enum'
import { User } from '@module/user/model/user.entity'
import { UserService } from '@module/user/user.service'

import { JwtAuthGuard } from '@shared/module/auth/guard/jwt-auth.guard'
import { RoleGuard } from '@shared/module/auth/guard/role.guard'

import { CurrentUser } from '@shared/decorator/current-user.decorator'
import { HasRoles } from '@shared/decorator/role.decorator'
import { DeleteResult, UpdateResult } from '@shared/dto/typeorm-result.dto'

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  /** Customer section */

  @Query(() => User)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.CUSTOMER)
  async fetchCustomer(@CurrentUser() user: User) {
    return await this.userService.fetchOne(user.id)
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.CUSTOMER)
  async updateCustomer(@CurrentUser() user: User, @Args('data') newUserData: UpdateUserInput): Promise<User> {
    return await this.userService.update(user.id, newUserData)
  }

  @Mutation(() => DeleteResult)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.CUSTOMER)
  async removeCustomer(@CurrentUser() user: User): Promise<DeleteResult> {
    return await this.userService.delete(user.id)
  }

  @Mutation(() => UpdateResult)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.CUSTOMER)
  async restoreCustomer(@CurrentUser() user: User): Promise<UpdateResult> {
    return await this.userService.restore(user.id)
  }

  /** Admin section */

  @Query(() => [User])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  async users(): Promise<User[]> {
    return await this.userService.fetch()
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  async user(@Args('id', { type: () => String }) id: string): Promise<User> {
    return await this.userService.fetchOne(id)
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  async updateUser(@Args('id', { type: () => String }) id: string, @Args('data') user: UpdateUserInput): Promise<User> {
    return await this.userService.update(id, user)
  }

  @Mutation(() => DeleteResult)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  async removeUser(@Args('id', { type: () => String }) id: string): Promise<DeleteResult> {
    return await this.userService.delete(id)
  }

  @Mutation(() => UpdateResult)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  async restoreUser(@Args('id', { type: () => String }) id: string): Promise<UpdateResult> {
    return await this.userService.restore(id)
  }

  @Mutation(() => User)
  async activateUser(@Args('token') token: string): Promise<User> {
    return await this.userService.activateAccount(token)
  }
}
