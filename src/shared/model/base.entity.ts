import { ObjectType } from '@nestjs/graphql'
import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@ObjectType()
export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date
}
