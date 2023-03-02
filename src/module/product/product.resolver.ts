import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'

import { SORT_DIR, SORT_OPTION } from '@module/product/constant/sort-options.constant'
import { CreateProductInput } from '@module/product/dto/create-product.input'
import { CreateRatingInput } from '@module/product/dto/create-rating.input'
import { FilterArgs } from '@module/product/dto/filter.args'
import { UpdateProductInput } from '@module/product/dto/update-product.input'
import { Brand } from '@module/product/model/brand.entity'
import { Category } from '@module/product/model/category.entity'
import { Product, ProductRam, ProductsFetchResponse, ProductStorage } from '@module/product/model/product.entity'
import { Rating } from '@module/product/model/rating.entity'
import { ProductService } from '@module/product/product.service'
import { Role } from '@module/user/enum/role.enum'
import { User } from '@module/user/model/user.entity'

import { JwtAuthGuard } from '@shared/module/auth/guard/jwt-auth.guard'
import { RoleGuard } from '@shared/module/auth/guard/role.guard'

import { CurrentUser } from '@shared/decorator/current-user.decorator'
import { HasRoles } from '@shared/decorator/role.decorator'
import { DeleteResult, UpdateResult } from '@shared/dto/typeorm-result.dto'
import { PaginationArgs } from '@shared/model/pagination.args'
import { SortArgs } from '@shared/model/sort.args'

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  /** Customer section */

  @Query(() => ProductsFetchResponse)
  async products(
    @Args('paginationArgs') paginationArgs: PaginationArgs,
    @Args('sortArgs', { nullable: true }) sortArgs?: SortArgs,
    @Args('filter', { nullable: true }) filter?: FilterArgs,
  ): Promise<ProductsFetchResponse> {
    return await this.productService.fetch(
      filter ? filter : null,
      paginationArgs,
      sortArgs ? sortArgs : { sortBy: SORT_OPTION.RATING, sortDir: SORT_DIR.DESC },
    )
  }

  @Query(() => [ProductRam])
  async getRamOptions(): Promise<ProductRam[]> {
    return await this.productService.fetchRamOptions()
  }

  @Query(() => [ProductStorage])
  async getStorageOptions(): Promise<ProductStorage[]> {
    return await this.productService.fetchStorageOptions()
  }

  @Query(() => Product)
  async product(@Args('id') id: string): Promise<Product> {
    return await this.productService.fetchOne(id)
  }

  @Query(() => [Brand])
  async brands(): Promise<Brand[]> {
    return await this.productService.fetchBrands()
  }

  @Query(() => [Category])
  async categories(): Promise<Category[]> {
    return await this.productService.fetchCategories()
  }

  @Query(() => [Rating])
  async ratings(): Promise<Rating[]> {
    return await this.productService.fetchRatings()
  }

  @Mutation(() => Rating)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.CUSTOMER)
  async createRating(@Args('data') rating: CreateRatingInput, @CurrentUser() user: User): Promise<Rating> {
    return this.productService.saveRating(rating, user.id)
  }

  /** Admin section */

  @Mutation(() => Product)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  async createProduct(@Args('data') product: CreateProductInput): Promise<Product> {
    return this.productService.save(product)
  }

  @Mutation(() => UpdateResult)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  async updateProduct(@Args('id') id: string, @Args('data') product: UpdateProductInput): Promise<UpdateResult> {
    return this.productService.update(id, product)
  }

  @Mutation(() => DeleteResult)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  async removeProduct(@Args('id') id: string): Promise<DeleteResult> {
    return await this.productService.delete(id)
  }

  @Mutation(() => UpdateResult)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @HasRoles(Role.ADMIN)
  async restoreProduct(@Args('id') id: string): Promise<UpdateResult> {
    return await this.productService.restore(id)
  }
}
