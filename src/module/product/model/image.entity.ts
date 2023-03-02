import { InputType, ObjectType } from '@nestjs/graphql'
import { AfterLoad, Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { Product } from '@module/product/model/product.entity'

import { BaseEntity } from '@shared/model/base.entity'

@ObjectType()
@InputType('ImageInput')
@Entity()
export class Image extends BaseEntity {
  @Column()
  url: string

  @ManyToOne(() => Product, product => product.image, { onDelete: 'CASCADE' })
  @JoinColumn()
  product?: Product

  @AfterLoad()
  formatUrl() {
    this.url = `http://${process.env.EXPRESS_HOST}:${process.env.EXPRESS_PORT}${this.url}`
  }
}
