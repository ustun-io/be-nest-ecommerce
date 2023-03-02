import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { Address } from '@module/address/model/address.entity'
import { OrderHasProduct } from '@module/order/model/order-has-product.entity'
import { User } from '@module/user/model/user.entity'

import { BaseEntity } from '@shared/model/base.entity'

@ObjectType()
@InputType('OrderInput')
@Entity()
export class Order extends BaseEntity {
  @Column()
  totalAmount: number

  @Column({ default: true })
  pending: boolean

  @Column({ type: 'datetime', nullable: true })
  cancelledAt?: Date

  @Field(() => [OrderHasProduct])
  @OneToMany(() => OrderHasProduct, orderHasProduct => orderHasProduct.order)
  products: OrderHasProduct[]

  @ManyToOne(() => User, user => user.order, { nullable: true })
  @JoinColumn()
  user?: User

  @ManyToOne(() => Address, address => address.id, { eager: true })
  @JoinColumn()
  shippingAddress?: Address

  @ManyToOne(() => Address, address => address.id, { eager: true })
  @JoinColumn()
  billingAddress?: Address
}
