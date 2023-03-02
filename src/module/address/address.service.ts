import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { ADDRESS_RELATIONS } from '@module/address/constant/entity-relation.constant'
import { CreateAddressInput } from '@module/address/dto/create-address.input'
import { UpdateAddressInput } from '@module/address/dto/update-address.input'
import { Address } from '@module/address/model/address.entity'

import { RECORD_NOT_FOUND } from '@shared/constant/error.constant'
import { DeleteResult, UpdateResult } from '@shared/dto/typeorm-result.dto'

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}
  /**
   * Fetches all records
   * @param where If included, used sql where statement (javascript object syntax)
   */
  async fetch(where?: object): Promise<Address[]> {
    try {
      return await this.addressRepo.find({ ...(where && { where }), relations: ADDRESS_RELATIONS })
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Fetch record by identifier
   * @param id Record identifier to be fetched
   * @param where If included, used sql where statement (javascript object syntax)
   */
  async fetchOne(id: string, where?: object): Promise<Address> {
    try {
      let address
      if (id) address = await this.addressRepo.findOne({ where: { id }, relations: ADDRESS_RELATIONS })
      if (where) address = await this.addressRepo.findOne({ where: where, relations: ADDRESS_RELATIONS })
      if (!address) throw new HttpException(RECORD_NOT_FOUND, HttpStatus.NOT_FOUND)

      return address
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Saves a record
   * @param address DTO
   */
  async save(address: CreateAddressInput): Promise<Address> {
    try {
      return await this.addressRepo.save(address)
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  /**
   * Updates record by id
   * @param id  Record id to be updated
   * @param address DTO
   */
  async update(id: string, address: UpdateAddressInput): Promise<UpdateResult> {
    try {
      return await this.addressRepo.update(id, address)
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Deletes a record by id
   * @param id Record id to be soft deleted
   */
  async delete(id: string): Promise<DeleteResult> {
    try {
      return await this.addressRepo.softDelete(id)
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Restores a record by id
   * @param id Record id to be restored
   */
  async restore(id: string): Promise<UpdateResult> {
    try {
      const addressRestored = await this.addressRepo.restore(id)
      if (!addressRestored) throw new HttpException(RECORD_NOT_FOUND, HttpStatus.NOT_FOUND)

      return addressRestored
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
