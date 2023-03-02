import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { CreateUserInput } from '@module/user/dto/create-user.input'
import { UserService } from '@module/user/user.service'

import { AuthService } from '@shared/module/auth/auth.service'
import { LoginUserInput } from '@shared/module/auth/dto/login-user.input'
import { ResetPasswordInput } from '@shared/module/auth/dto/reset-password.input'
import { LocalAuthGuard } from '@shared/module/auth/guard/local-auth.guard'
import { EmailResponse } from '@shared/module/auth/model/email-response.model'
import { LoginResponse } from '@shared/module/auth/model/login-response.model'
import { RegisterResponse } from '@shared/module/auth/model/register-response.model'
import { TokenVerificationResponse } from '@shared/module/auth/model/token-response.model'

import { UpdateResult } from '@shared/dto/typeorm-result.dto'

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService, private userService: UserService) {}

  @Mutation(() => RegisterResponse)
  async signUp(@Args('data') registerCredentials: CreateUserInput): Promise<RegisterResponse> {
    const { email, password, phone } = registerCredentials
    const payload = { email, password, phone }

    return await this.authService.register(payload)
  }

  @UseGuards(LocalAuthGuard)
  @Mutation(() => LoginResponse, { nullable: true })
  async signIn(@Args('data') loginCredentials: LoginUserInput): Promise<LoginResponse> {
    return await this.authService.login(loginCredentials)
  }

  @Query(() => EmailResponse)
  async requestPasswordChange(@Args('email') email: string) {
    return await this.authService.sendPasswordChangeMail(email)
  }

  @Query(() => TokenVerificationResponse)
  async verifyToken(@Args('token') token: string, @Args('tokenOption') tokenOption: string) {
    const response = await this.authService.verifyToken(token, tokenOption)
    if (response) {
      return { valid: true }
    } else {
      return { valid: false }
    }
  }

  @Mutation(() => UpdateResult)
  async changePassword(@Args('data') passwordChangeParams: ResetPasswordInput) {
    const { token, password } = passwordChangeParams
    return await this.userService.resetPassword(token, password)
  }
}
