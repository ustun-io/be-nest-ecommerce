import { ObjectType } from '@nestjs/graphql'

import { User } from '@module/user/model/user.entity'

@ObjectType()
export class LoginResponse {
  user: User
  accessToken: string
}
