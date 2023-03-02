import { InputType } from '@nestjs/graphql'
import { IsUUID, Length } from 'class-validator'

@InputType()
export class ResetPasswordInput {
  @Length(6, 96)
  password: string

  @IsUUID('4')
  token: string
}
