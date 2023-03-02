import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'
import { ClassType } from '@nestjs/graphql/dist/enums/class-type.enum'

import { FilterArgs } from '@module/product/dto/filter.args'

import { PaginationArgs } from '@shared/model/pagination.args'

// @ts-ignore
export function FetchResponse<T>(cls: ClassType<T>) {
  @ObjectType({ isAbstract: true })
  @InputType('FetchResponseInput')
  abstract class FetchResponse extends PaginationArgs {
    @Field(() => [cls])
    data: T[]

    @Field(() => Int)
    count: number

    @Field(() => FilterArgs)
    filter: FilterArgs

    /*@Field(() => Int)
    totalCount: number

    @Field(() => Int)
    meta: number*/
  }
  return FetchResponse
}
