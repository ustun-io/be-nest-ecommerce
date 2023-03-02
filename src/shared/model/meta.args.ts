import { Field, InputType, ObjectType } from '@nestjs/graphql'

@ObjectType()
@InputType('MetaArgsInput')
export class MetaArgs {
  @Field({ nullable: true })
  startCursor: string

  @Field({ nullable: true })
  endCursor: string

  @Field()
  hasPreviousPage: boolean

  @Field()
  hasNextPage: boolean
}
