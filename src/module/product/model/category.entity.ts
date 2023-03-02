import { InputType, ObjectType } from '@nestjs/graphql'
import { Column, Entity, OneToMany } from 'typeorm'

import { Product } from '@module/product/model/product.entity'

import { BaseEntity } from '@shared/model/base.entity'

@ObjectType()
@InputType('CategoryInput')
@Entity()
export class Category extends BaseEntity {
  @Column({ unique: true })
  name: string

  @OneToMany(() => Product, (product: Product) => product.category)
  product?: Product
}
