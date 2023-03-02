import { InputType } from '@nestjs/graphql'
import { IsEmail, Length } from 'class-validator'

@InputType()
export class LoginUserInput {
  @IsEmail()
  email: string

  @Length(6, 96)
  password: string
}
