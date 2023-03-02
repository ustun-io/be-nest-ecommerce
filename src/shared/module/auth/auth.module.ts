import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { UserModule } from '@module/user/user.module'

import { AuthResolver } from '@shared/module/auth/auth.resolver'
import { AuthService } from '@shared/module/auth/auth.service'
import { JwtStrategy } from '@shared/module/auth/strategy/jwt.strategy'
import { LocalStrategy } from '@shared/module/auth/strategy/local.strategy'

import { ENV } from '@shared/constant/env.constant'

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ENV }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.TOKEN_EXPIRES_IN },
    }),
    PassportModule,
    UserModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, AuthResolver],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
