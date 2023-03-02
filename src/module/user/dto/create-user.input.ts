import { InputType } from '@nestjs/graphql'
import { IsEmail, IsMobilePhone, Length } from 'class-validator'

import { User } from '@module/user/model/user.entity'

@InputType()
export class CreateUserInput extends User {
  @IsEmail()
  email: string

  @Length(6, 96)
  password: string

  @IsMobilePhone('any')
  phone?: string
}
