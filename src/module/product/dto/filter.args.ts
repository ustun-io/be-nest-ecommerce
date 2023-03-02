import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'
import { IsString, Min } from 'class-validator'

@ObjectType()
@InputType('FilterArgsInput')
export class FilterArgs {
  @Field(() => [String], { nullable: 'itemsAndList' })
  brand?: string[]
  @Field(() => [String], { nullable: 'itemsAndList' })
  category?: string[]
  @Field(() => [Int], { nullable: 'itemsAndList' })
  ram?: number[]
  @Field(() => [Int], { nullable: 'itemsAndList' })
  storage?: number[]
  @IsString()
  @Min(2)
  @Field(() => String, { nullable: true })
  search?: string
  priceMin?: number
  priceMax?: number
}
