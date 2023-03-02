import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { Product } from '@module/product/model/product.entity'
import { User } from '@module/user/model/user.entity'

import { BaseEntity } from '@shared/model/base.entity'

@ObjectType()
@InputType('RatingInput')
@Entity()
export class Rating extends BaseEntity {
  @Column({ type: 'text' })
  text: string

  @Field(() => Int)
  @Column({ type: 'tinyint' })
  star: number

  @ManyToOne(() => Product, product => product.rating, { cascade: true, eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  product: Product

  @ManyToOne(() => User, user => user.rating, { cascade: true, eager: true })
  @JoinColumn()
  user: User
}
