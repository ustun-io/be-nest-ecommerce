import { InputType } from '@nestjs/graphql'

import { AddressType } from '@module/address/enum/address-type.enum'
import { Country } from '@module/address/enum/country-iso3166.enum'
import { User } from '@module/user/model/user.entity'

@InputType()
export class CreateAddressInput {
  firstName: string
  lastName: string
  companyName?: string
  line1: string
  zipCode: string
  state: string
  phone?: string
  countryCode: Country
  primary: boolean
  type: AddressType
  user?: User
}
