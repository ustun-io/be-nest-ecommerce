import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class CreateOrderInput {
  totalAmount: number
  shippingTo: string
  billingTo?: string
  products: AddProductToOrderInput[]
}

@InputType()
class AddProductToOrderInput {
  @Field(() => Int)
  quantity: number

  @Field(() => String)
  product: string
}
