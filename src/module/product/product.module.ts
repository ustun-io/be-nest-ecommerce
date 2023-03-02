import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Brand } from '@module/product/model/brand.entity'
import { Category } from '@module/product/model/category.entity'
import { Image } from '@module/product/model/image.entity'
import { Product } from '@module/product/model/product.entity'
import { Rating } from '@module/product/model/rating.entity'
import { ProductResolver } from '@module/product/product.resolver'
import { ProductService } from '@module/product/product.service'

@Module({
  imports: [TypeOrmModule.forFeature([Product, Brand, Category, Image, Rating])],
  providers: [ProductService, ProductResolver],
  exports: [ProductService],
})
export class ProductModule {}
