/**
 * This entity could be skipped to implement since TypeORM's "ManyToMany" creates a join table automatically.
 * Since information is required, on how many times a product was ordered in one single order,
 * this entity is implemented with the custom column "quantity".
 */
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Order } from '@module/order/model/order.entity'
import { Product } from '@module/product/model/product.entity'

@ObjectType()
@InputType('OrderHasProductInput')
@Entity()
export class OrderHasProduct {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @Field(() => Int)
  @Column()
  quantity: number

  @ManyToOne(() => Order, order => order.products, { onDelete: 'CASCADE' })
  @JoinColumn()
  order: Order

  @Field(() => Product)
  @ManyToOne(() => Product, product => product.order, { onDelete: 'SET NULL' })
  @JoinColumn()
  product: Product
}
