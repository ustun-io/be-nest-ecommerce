import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AddressResolver } from '@module/address/address.resolver'
import { AddressService } from '@module/address/address.service'
import { Address } from '@module/address/model/address.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Address])],
  providers: [AddressResolver, AddressService],
  exports: [AddressService],
})
export class AddressModule {}
