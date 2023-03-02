import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { genSalt, hash } from 'bcrypt'
import { DataSource, Repository } from 'typeorm'

import { AddressService } from '@module/address/address.service'
import { addressMock } from '@module/address/mock/address.mock'
import { Address } from '@module/address/model/address.entity'
import { USER_RELATIONS } from '@module/user/constant/entity-relation.constant'
import { CreateUserInput } from '@module/user/dto/create-user.input'
import { UpdateUserInput } from '@module/user/dto/update-user.input'
import { userMock } from '@module/user/mock/user.mock'
import { User } from '@module/user/model/user.entity'

import { TOKEN_INVALID } from '@shared/module/auth/constant/response.constant'

import { RECORD_NOT_FOUND } from '@shared/constant/error.constant'
import { DeleteResult, UpdateResult } from '@shared/dto/typeorm-result.dto'

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly addressService: AddressService,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.insertUsers()
    await this.insertAddresses()
  }

  /**
   * Fetches all records
   * @param where If included, used sql where statement (javascript object syntax)
   */
  async fetch(where?: object): Promise<User[]> {
    try {
      return await this.userRepo.find({ ...(where && { where }), relations: ['order', 'order.user'] })
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Fetch record by identifier
   * @param id Record identifier to be fetched
   * @param where If included, used sql where statement (javascript object syntax)
   */
  async fetchOne(id: string, where?: object): Promise<User> {
    try {
      let user
      if (id) user = await this.userRepo.findOne({ where: { id }, relations: USER_RELATIONS })
      if (where) user = await this.userRepo.findOne({ where: where, relations: USER_RELATIONS })

      return user
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Saves a record
   * @param user DTO
   */
  async save(user: CreateUserInput): Promise<User | UpdateResult> {
    try {
      const { email, password } = user

      const userFound = await this.userRepo.findOne({ where: { email } })
      if (userFound) return await this.userRepo.update(userFound.id, user)

      const salt = await genSalt()
      user.password = await hash(password, salt)

      return await this.userRepo.save(user)
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Updates record by identifier
   * @param id  Record identifier to be updated
   * @param user DTO
   */
  async update(id: string, user: UpdateUserInput): Promise<User> {
    try {
      const record = await this.userRepo.findOne({ where: { id }, relations: USER_RELATIONS })
      Object.assign(record, user)
      return await this.userRepo.save(record)
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Deletes a record by identifier
   * @param id Record id identifier be soft deleted
   */
  async delete(id: string): Promise<DeleteResult> {
    try {
      return await this.userRepo.softDelete(id)
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Restores a record by identifier
   * @param id Record identifier to be restored
   */
  async restore(id: string): Promise<UpdateResult> {
    try {
      const userRestored = await this.userRepo.restore(id)
      if (!userRestored) throw new HttpException(RECORD_NOT_FOUND, HttpStatus.NOT_FOUND)

      return userRestored
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Changes user password
   * @param token UUID4 token
   * @param userPassword New password
   */
  async resetPassword(token: string, userPassword: string): Promise<UpdateResult> {
    try {
      const user = await this.userRepo.findOneBy({ resetPasswordToken: token })
      if (!user) throw new HttpException(TOKEN_INVALID, HttpStatus.NO_CONTENT)

      const salt = await genSalt()
      user.password = await hash(userPassword, salt)
      user.resetPasswordToken = null

      return await this.userRepo.update(user.id, user)
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Activates user account (sets activated_at column)
   * @param token UUID4 token
   */
  async activateAccount(token: string): Promise<User> {
    try {
      const user = await this.fetchOne(null, { activateAccountToken: token })
      if (!user) throw new HttpException(TOKEN_INVALID, HttpStatus.UNAUTHORIZED)

      user.activatedAt = new Date()
      user.activateAccountToken = null

      return await this.update(user.id, user)
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Inserts data into User table from `user.mock.ts`
   * Won't insert if data is found in table
   */
  async insertUsers(): Promise<any> {
    try {
      const users = await this.userRepo.find()
      if (users.length === 0) {
        return await this.dataSource.createQueryBuilder().insert().into(User).values(userMock).execute()
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Inserts data into Address table from `address.mock.ts`
   * Won't insert if data is found in table
   */
  async insertAddresses(): Promise<any> {
    try {
      const addresses = await this.addressService.fetch()
      if (addresses.length === 0) {
        return await this.dataSource.createQueryBuilder().insert().into(Address).values(addressMock).execute()
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
