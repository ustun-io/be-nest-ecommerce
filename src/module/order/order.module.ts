import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AddressModule } from '@module/address/address.module'
import { Order } from '@module/order/model/order.entity'
import { OrderHasProduct } from '@module/order/model/order-has-product.entity'
import { OrderResolver } from '@module/order/order.resolver'
import { OrderService } from '@module/order/order.service'
import { ProductModule } from '@module/product/product.module'
import { UserModule } from '@module/user/user.module'

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderHasProduct]), AddressModule, UserModule, ProductModule],
  providers: [OrderService, OrderResolver],
})
export class OrderModule {}
