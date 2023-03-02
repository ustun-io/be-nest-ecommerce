import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'
import { IsNumber, IsOptional, Min } from 'class-validator'

@ObjectType()
@InputType('PaginationArgsInput')
export class PaginationArgs {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Field(() => Int)
  page?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Field(() => Int)
  limit?: number
}
