import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { CreateOrderInput } from '@module/order/dto/create-order.input'
import { Order } from '@module/order/model/order.entity'
import { OrderService } from '@module/order/order.service'
import { Role } from '@module/user/enum/role.enum'
import { User } from '@module/user/model/user.entity'
import { UserService } from '@module/user/user.service'

import { JwtAuthGuard } from '@shared/module/auth/guard/jwt-auth.guard'
import { RoleGuard } from '@shared/module/auth/guard/role.guard'

import { CurrentUser } from '@shared/decorator/current-user.decorator'
import { HasRoles } from '@shared/decorator/role.decorator'
import { UpdateResult } from '@shared/dto/typeorm-result.dto'

@Resolver()
export class OrderResolver {
  constructor(private readonly orderService: OrderService, private userService: UserService) {}

  /** Customer section */
  @Query(() => [Order])
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.CUSTOMER)
  async currentOrders(@CurrentUser() currentUser: User): Promise<Order[]> {
    return await this.orderService.fetch({ user: { id: currentUser.id } })
  }

  @Query(() => Order)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.CUSTOMER)
  async order(@Args('id') id: string): Promise<Order> {
    return await this.orderService.fetchOne(id)
  }

  @Mutation(() => Order)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.CUSTOMER)
  async createOrder(@CurrentUser() currentUser: User, @Args('data') order: CreateOrderInput): Promise<Order> {
    const user = await this.userService.fetchOne(currentUser.id)
    return await this.orderService.save(order, user)
  }

  @Mutation(() => UpdateResult)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.CUSTOMER)
  async cancelOrder(@Args('id') id: string): Promise<UpdateResult> {
    return await this.orderService.cancel(id)
  }
}
