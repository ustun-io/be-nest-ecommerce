import { HideField, InputType, ObjectType, registerEnumType } from '@nestjs/graphql'
import { IsEmail, Length } from 'class-validator'
import { Column, Entity, OneToMany } from 'typeorm'

import { Address } from '@module/address/model/address.entity'
import { Order } from '@module/order/model/order.entity'
import { Rating } from '@module/product/model/rating.entity'
import { Role } from '@module/user/enum/role.enum'

import { BaseEntity } from '@shared/model/base.entity'

registerEnumType(Role, {
  name: 'Role',
})

@ObjectType()
@InputType('UserInput')
@Entity()
export class User extends BaseEntity {
  @IsEmail()
  @Column({ type: 'varchar', length: 512, unique: true })
  email: string

  @Length(6, 96)
  @HideField()
  @Column({ type: 'varchar', length: 96 })
  password: string

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CUSTOMER,
    nullable: true,
  })
  role?: Role

  @Column({ nullable: true, length: 16 })
  phone?: string

  @Column({ type: 'datetime', nullable: true })
  activatedAt?: Date

  @Column({ unique: true, nullable: true })
  activateAccountToken?: string

  @Column({ unique: true, nullable: true })
  resetPasswordToken?: string

  @OneToMany(() => Address, address => address.user, { eager: true })
  address?: Address[]

  @OneToMany(() => Order, order => order.user)
  order?: Order[]

  @OneToMany(() => Rating, rating => rating.user)
  rating?: Rating[]
}
