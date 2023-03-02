import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { MailerService } from '@nestjs-modules/mailer'
import { compare } from 'bcrypt'
import { randomUUID } from 'crypto'

import { CreateUserInput } from '@module/user/dto/create-user.input'
import { User } from '@module/user/model/user.entity'
import { UserService } from '@module/user/user.service'

import {
  ACCOUNT_CREATED,
  ACCOUNT_EXISTS,
  ACCOUNT_NOT_FOUND,
  INVALID_CREDENTIALS,
  PASSWORD_CHANGE_REQUEST_CREATED,
} from '@shared/module/auth/constant/response.constant'
import { TOKEN_TYPES } from '@shared/module/auth/constant/token-type.constant'
import { LoginUserInput } from '@shared/module/auth/dto/login-user.input'
import { EmailResponse } from '@shared/module/auth/model/email-response.model'
import { LoginResponse } from '@shared/module/auth/model/login-response.model'
import { RegisterResponse } from '@shared/module/auth/model/register-response.model'
import { ACTIVATE_ACCOUNT, PASSWORD_REQUEST, SUBJECT } from '@shared/module/email/constant/email.constant'

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwtService: JwtService, private mailService: MailerService) {}

  /**
   * Validates user input for existing emails in DB and matching password (comparing hash and user password input)
   * @param email
   * @param pass
   */
  async validateUser(email: string, pass: string): Promise<Partial<User>> {
    const userFound = await this.userService.fetchOne(undefined, { email })
    if (!userFound) {
      throw new HttpException(ACCOUNT_NOT_FOUND, HttpStatus.UNAUTHORIZED)
    }

    const passwordMatches = await compare(pass, userFound.password)
    if (!passwordMatches) {
      throw await new HttpException(INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED)
    }

    if (userFound && passwordMatches) {
      const { password, ...rest } = userFound
      return rest
    }
    return null
  }

  async register(user: CreateUserInput): Promise<RegisterResponse> {
    const { email } = user
    const userFound = await this.userService.fetchOne(null, { email })
    if (userFound) throw new HttpException(ACCOUNT_EXISTS, HttpStatus.UNAUTHORIZED)

    let status: RegisterResponse = {
      success: false,
      message: '',
    }

    try {
      await this.userService.save(user).then(async () => {
        status.success = true
        status.message = ACCOUNT_CREATED
        await this.sendAccountActivationMail(email)
      })
    } catch (error) {
      status = {
        success: false,
        message: error,
      }
      return status
    }
    if (!status.success) {
      throw new HttpException(status.message, HttpStatus.BAD_REQUEST)
    }
    return status
  }

  async login(userInput: LoginUserInput): Promise<LoginResponse> {
    const user = await this.userService.fetchOne(null, { email: userInput.email })
    if (!user) throw new HttpException(ACCOUNT_NOT_FOUND, HttpStatus.UNAUTHORIZED)

    const { id, email, role, activatedAt } = user

    const payload = { sub: id, email, role, activatedAt }
    return {
      user,
      accessToken: this.jwtService.sign(payload),
    }
  }

  async verifyToken(token: string, option: string): Promise<boolean> {
    if (option === TOKEN_TYPES.PASSWORD_RESET) {
      const userFound = await this.userService.fetchOne(null, { resetPasswordToken: token })
      return !!userFound
    } else if (option === TOKEN_TYPES.ACCOUNT_ACTIVATION) {
      const userFound = await this.userService.fetchOne(null, { activateAccountToken: token })
      return !!userFound
    }
  }

  async setToken(id: string, token: string, option: string): Promise<User> {
    try {
      const userFound = await this.userService.fetchOne(id, null)
      if (!userFound) throw new HttpException(ACCOUNT_NOT_FOUND, HttpStatus.UNAUTHORIZED)

      if (option === TOKEN_TYPES.ACCOUNT_ACTIVATION) userFound.activateAccountToken = token

      if (option === TOKEN_TYPES.PASSWORD_RESET) userFound.resetPasswordToken = token

      return await this.userService.update(id, userFound)
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async sendPasswordChangeMail(email: string): Promise<EmailResponse> {
    try {
      const userFound = await this.userService.fetchOne(null, { email })
      if (!userFound) throw new HttpException(ACCOUNT_NOT_FOUND, HttpStatus.UNAUTHORIZED)

      const token = randomUUID()
      await this.setToken(userFound.id, token, TOKEN_TYPES.PASSWORD_RESET)

      return await this.mailService
        .sendMail({
          to: email,
          subject: `${SUBJECT} - ${PASSWORD_REQUEST}`,
          template: 'password-reset.template.hbs',
          context: {
            resetLink: `${process.env.FE_HOST}/${process.env.FRONTEND_PASSWORD_RESET}?uuid=${token}`,
            website: `${process.env.FE_HOST}`,
            name: email.slice(0, email.indexOf('@')),
            date: new Date().getFullYear(),
          },
        })
        .then(response => {
          return {
            success: true,
            message: PASSWORD_CHANGE_REQUEST_CREATED,
            rejected: response.rejected,
          }
        })
        .catch(error => {
          return error
        })
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async sendAccountActivationMail(email: string): Promise<EmailResponse> {
    try {
      const userFound = await this.userService.fetchOne(null, { email })
      if (!userFound) throw new HttpException(ACCOUNT_NOT_FOUND, HttpStatus.UNAUTHORIZED)

      const activationToken = randomUUID()
      await this.setToken(userFound.id, activationToken, TOKEN_TYPES.ACCOUNT_ACTIVATION)

      return await this.mailService
        .sendMail({
          to: email,
          subject: `${SUBJECT} - ${ACTIVATE_ACCOUNT}`,
          template: 'account-activation.template.hbs',
          context: {
            activationLink: `${process.env.FE_HOST}/${process.env.FRONTEND_ACCOUNT_ACTIVATION}?uuid=${activationToken}`,
            website: `${process.env.FE_HOST}`,
            name: email.slice(0, email.indexOf('@')),
            date: new Date().getFullYear(),
          },
        })
        .then(response => {
          return {
            success: true,
            message: ACCOUNT_CREATED,
            rejected: response.rejected,
          }
        })
        .catch(error => {
          return error
        })
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
