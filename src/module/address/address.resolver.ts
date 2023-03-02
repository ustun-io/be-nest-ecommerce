import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { AddressService } from '@module/address/address.service'
import { CreateAddressInput } from '@module/address/dto/create-address.input'
import { UpdateAddressInput } from '@module/address/dto/update-address.input'
import { Address } from '@module/address/model/address.entity'
import { Role } from '@module/user/enum/role.enum'
import { User } from '@module/user/model/user.entity'

import { JwtAuthGuard } from '@shared/module/auth/guard/jwt-auth.guard'
import { RoleGuard } from '@shared/module/auth/guard/role.guard'

import { CurrentUser } from '@shared/decorator/current-user.decorator'
import { HasRoles } from '@shared/decorator/role.decorator'
import { DeleteResult, UpdateResult } from '@shared/dto/typeorm-result.dto'

@Resolver(() => Address)
export class AddressResolver {
  constructor(private readonly addressService: AddressService) {}

  /** Customer section */

  @Query(() => [Address])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.CUSTOMER)
  async addresses(@CurrentUser() user: User): Promise<Address[]> {
    return await this.addressService.fetch({ user: { id: user.id } })
  }

  @Query(() => Address)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  async address(@Args('id', { type: () => String }) id: string): Promise<Address> {
    return await this.addressService.fetchOne(id)
  }

  @Mutation(() => Address)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.CUSTOMER)
  async createAddress(@CurrentUser() user: User, @Args('data') address: CreateAddressInput): Promise<Address> {
    return await this.addressService.save({ ...address, user })
  }

  @Mutation(() => UpdateResult)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.CUSTOMER)
  async updateCustomerAddress(
    @Args('id', { type: () => String }) id: string,
    @Args('data') address: UpdateAddressInput,
  ): Promise<UpdateResult> {
    return await this.addressService.update(id, address)
  }

  /** Admin section */

  @Mutation(() => UpdateResult)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  async updateAddress(
    @Args('id', { type: () => String }) id: string,
    @Args('data') address: UpdateAddressInput,
  ): Promise<UpdateResult> {
    return await this.addressService.update(id, address)
  }

  @Mutation(() => DeleteResult)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  async removeAddress(@Args('id', { type: () => String }) id: string): Promise<DeleteResult> {
    return await this.addressService.delete(id)
  }

  @Mutation(() => UpdateResult)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  async restoreAddress(@Args('id', { type: () => String }) id: string): Promise<UpdateResult> {
    return await this.addressService.restore(id)
  }
}
