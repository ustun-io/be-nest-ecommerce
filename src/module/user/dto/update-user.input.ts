import { InputType, PartialType } from '@nestjs/graphql'

import { CreateUserInput } from '@module/user/dto/create-user.input'

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}
