import { InputType, ObjectType } from '@nestjs/graphql'
import { Column, Entity, OneToMany } from 'typeorm'

import { Product } from '@module/product/model/product.entity'

import { BaseEntity } from '@shared/model/base.entity'

@ObjectType()
@InputType('BrandInput')
@Entity()
export class Brand extends BaseEntity {
  @Column({ unique: true })
  name: string

  @OneToMany(() => Product, (product: Product) => product.brand)
  product?: Product
}
