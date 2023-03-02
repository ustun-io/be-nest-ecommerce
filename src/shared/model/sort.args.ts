import { Field, InputType, ObjectType } from '@nestjs/graphql'

import { SortDir, SortOption } from '@module/product/constant/sort-options.constant'

@ObjectType()
@InputType('SortArgsInput')
export class SortArgs {
  @Field(() => String)
  sortBy: SortOption

  @Field(() => String)
  sortDir: SortDir
}
