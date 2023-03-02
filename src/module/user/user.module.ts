import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AddressModule } from '@module/address/address.module'
import { User } from '@module/user/model/user.entity'
import { UserResolver } from '@module/user/user.resolver'
import { UserService } from '@module/user/user.service'

@Module({
  imports: [TypeOrmModule.forFeature([User]), AddressModule],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
