import { Field, InputType, Int } from '@nestjs/graphql'

import { OrderHasProduct } from '@module/order/model/order-has-product.entity'

@InputType()
export class CreateProductInput {
  name: string
  description?: string
  thumbnail?: string
  price: number
  discount?: number
  screen?: string
  cpu?: string
  brandId: string
  categoryId: string
  imageArray: string[]
  order?: OrderHasProduct[]
  @Field(() => Int)
  stock: number
  @Field(() => Int)
  ram?: number
  @Field(() => Int)
  storage?: number
}
