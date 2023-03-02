import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'
import { AfterLoad, Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'

import { OrderHasProduct } from '@module/order/model/order-has-product.entity'
import { Brand } from '@module/product/model/brand.entity'
import { Category } from '@module/product/model/category.entity'
import { Image } from '@module/product/model/image.entity'
import { Rating } from '@module/product/model/rating.entity'

import { BaseEntity } from '@shared/model/base.entity'
import { FetchResponse } from '@shared/model/fetch-response.entity'

@ObjectType()
@InputType('ProductInput')
@Entity()
export class Product extends BaseEntity {
  @Column()
  name: string

  @Column({ nullable: true, length: 1048 })
  description?: string

  @Column({ nullable: true })
  thumbnail?: string

  @Column({ type: 'float' })
  price: number

  @Column({ type: 'float', nullable: true })
  discount?: number

  @Field(() => Int)
  @Column()
  stock: number

  @Column({ nullable: true })
  screen?: string

  @Field(() => Int)
  @Column({ nullable: true })
  storage?: number

  @Column({ nullable: true })
  cpu?: string

  @Field(() => Int)
  @Column({ nullable: true })
  ram?: number

  @ManyToOne(() => Brand, brand => brand.product, { cascade: true })
  @JoinColumn()
  brand: Brand

  @ManyToOne(() => Category, category => category.product, { cascade: true })
  @JoinColumn()
  category: Category

  @OneToMany(() => Image, image => image.product, { eager: true, cascade: true })
  image?: Image[]

  @OneToMany(() => Rating, rating => rating.product)
  rating?: Rating[]

  @OneToMany(() => OrderHasProduct, orderHasProducts => orderHasProducts.product)
  order?: OrderHasProduct[]

  ratingAverage?: number
  basicName?: string

  @AfterLoad()
  afterLoad() {
    const screen = this.screen && this.screen
    const cpu = this.cpu && this.cpu
    const storage = this.storage && this.storage
    const ram = this.ram && this.ram
    const info = `(${screen}, ${cpu}, ${storage}GB, ${ram}GB)`
    this.basicName = this.name
    this.name = `${this.name} ${info}`
  }

  @AfterLoad()
  formatUrl() {
    this.thumbnail = `http://${process.env.EXPRESS_HOST}:${process.env.EXPRESS_PORT}${this.thumbnail}`
  }
}

@ObjectType()
export class ProductRam {
  label: string
  @Field(() => Int)
  value: number
}

@ObjectType()
export class ProductStorage {
  label: string
  @Field(() => Int)
  value: number
}

@ObjectType()
@InputType('ProductsFetchResponseInput')
export class ProductsFetchResponse extends FetchResponse(Product) {}
