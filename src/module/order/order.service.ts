import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { AddressService } from '@module/address/address.service'
import { ORDER_RELATIONS } from '@module/order/constant/entity-relation.constant'
import { SPECIFY_SHIPPING_ADDRESS } from '@module/order/constant/error.constant'
import { CreateOrderInput } from '@module/order/dto/create-order.input'
import { Order } from '@module/order/model/order.entity'
import { OrderHasProduct } from '@module/order/model/order-has-product.entity'
import { User } from '@module/user/model/user.entity'

import { RECORD_NOT_FOUND, RECORD_NOT_SAVED } from '@shared/constant/error.constant'
import { UpdateResult } from '@shared/dto/typeorm-result.dto'

import { ProductService } from '../product/product.service'

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderHasProduct)
    private readonly orderHasProductRepo: Repository<OrderHasProduct>,
    private addressService: AddressService,
    private productService: ProductService,
  ) {}

  /**
   * Fetches all records
   * @param where If included, used sql where statement (javascript object syntax)
   */
  async fetch(where?: object): Promise<Order[]> {
    try {
      return await this.orderRepo.find({ ...(where && { where }), relations: ORDER_RELATIONS })
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Fetch record by identifier
   * @param id Record identifier to be fetched
   * @param where If included, used sql where statement (javascript object syntax)
   */
  async fetchOne(id: string, where?: object): Promise<Order> {
    try {
      let product
      if (id) product = await this.orderRepo.findOne({ where: { id }, relations: ORDER_RELATIONS })
      if (where) product = await this.orderRepo.findOne({ where: where, relations: ORDER_RELATIONS })
      if (!product) throw new HttpException(RECORD_NOT_FOUND, HttpStatus.NOT_FOUND)

      return product
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Saves a record
   * @param order DTO
   * @param user Order belongs to user
   */
  async save(order: CreateOrderInput, user: User): Promise<Order> {
    try {
      const shippingAddress = await this.addressService.fetchOne(order.shippingTo)
      if (!order.shippingTo) throw new HttpException(SPECIFY_SHIPPING_ADDRESS, HttpStatus.BAD_REQUEST)
      delete order.shippingTo
      const billingAddress = order.billingTo ? await this.addressService.fetchOne(order.billingTo) : null
      delete order.billingTo

      const savedOrder = await this.orderRepo.save({
        ...order,
        shippingAddress,
        billingAddress,
        user,
        products: [],
      })

      await Promise.all(
        order?.products?.map(async _product => {
          const { product, quantity } = _product
          const foundProduct = await this.productService.fetchOne(product)
          await this.orderHasProductRepo.save({
            quantity,
            order: savedOrder,
            product: foundProduct,
          })
          savedOrder.products.push(foundProduct)
        }),
      )
      await this.orderRepo.update(savedOrder.id, savedOrder)

      const orderSaved = await this.fetchOne(savedOrder.id)

      if (!orderSaved)
        throw new HttpException(RECORD_NOT_SAVED, HttpStatus.BAD_REQUEST, { cause: new Error(RECORD_NOT_SAVED) })

      return orderSaved
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Cancel an order
   */
  async cancel(id: string): Promise<UpdateResult> {
    try {
      const order = await this.orderRepo.findOne({ where: { id } })
      if (!order) throw new HttpException(RECORD_NOT_FOUND, HttpStatus.NOT_FOUND)

      return await this.orderRepo.update({ id }, { cancelledAt: new Date() })
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
