import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'

import { PRODUCT_RELATIONS, RATING_RELATIONS } from '@module/product/constant/entity-relation.constant'
import { DEFAULT_MAX_PRICE, DEFAULT_MIN_PRICE } from '@module/product/constant/filter.constant'
import { SORT_OPTION } from '@module/product/constant/sort-options.constant'
import { CreateProductInput } from '@module/product/dto/create-product.input'
import { CreateRatingInput } from '@module/product/dto/create-rating.input'
import { FilterArgs } from '@module/product/dto/filter.args'
import { UpdateProductInput } from '@module/product/dto/update-product.input'
import { brandMock } from '@module/product/mock/brand.mock'
import { categoryMock } from '@module/product/mock/category.mock'
import { productMock } from '@module/product/mock/product.mock'
import { ratingMock } from '@module/product/mock/rating.mock'
import { Brand } from '@module/product/model/brand.entity'
import { Category } from '@module/product/model/category.entity'
import { Image } from '@module/product/model/image.entity'
import { Product, ProductRam, ProductsFetchResponse, ProductStorage } from '@module/product/model/product.entity'
import { Rating } from '@module/product/model/rating.entity'
import { withRating, withRatingArray } from '@module/product/util/rating-average.util'

import { RECORD_NOT_FOUND } from '@shared/constant/error.constant'
import { DeleteResult, UpdateResult } from '@shared/dto/typeorm-result.dto'
import { PaginationArgs } from '@shared/model/pagination.args'
import { SortArgs } from '@shared/model/sort.args'

@Injectable()
export class ProductService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Image)
    private readonly imageRepo: Repository<Image>,
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.insertBrands()
    await this.insertCategories()
    await this.insertProducts()
    await this.insertRatings()
  }

  /**
   * Fetches all records
   * @param filter
   * @param pagination
   * @param sort
   */
  async fetch(filter?: FilterArgs, pagination?: PaginationArgs, sort?: SortArgs): Promise<ProductsFetchResponse> {
    try {
      const {
        brand,
        category,
        ram,
        storage,
        search,
        priceMin = DEFAULT_MIN_PRICE,
        priceMax = DEFAULT_MAX_PRICE,
      } = filter
      const { page, limit } = pagination
      const { sortBy, sortDir } = sort

      // base query
      const query = await this.productRepo.createQueryBuilder('product')

      // relationships
      query.innerJoinAndSelect('product.brand', 'brand')
      query.innerJoinAndSelect('product.category', 'category')
      query.leftJoinAndSelect('product.image', 'image')
      query.leftJoinAndSelect('product.rating', 'rating')

      // search
      search &&
        query.andWhere('(product.name LIKE :search OR product.description LIKE :search OR product.cpu LIKE :search)', {
          search: `%${search}%`,
        })

      // filter
      brand && query.andWhere(filter && brand && 'brand.name IN (:...brand)', { brand })
      category && query.andWhere(filter && category && 'category.name IN (:...category)', { category })
      ram && query.andWhere(filter && ram && 'ram IN (:...ram)', { ram })
      storage && query.andWhere(filter && storage && 'storage IN (:...storage)', { storage })
      query.andWhere(`\`product\`.\`price\` BETWEEN ${Number(priceMin)} AND ${Number(priceMax)}`)

      // pagination
      query.skip(page ? (page - 1) * limit : 0)
      query.take(limit)

      // sort
      query.orderBy(sortBy !== SORT_OPTION.RATING ? `product.${sortBy}` : 'rating.star', sortDir)

      const products = await query.getMany()
      const count = await query.getCount()

      // calculate average rating and add to each product into property ratingAverage
      return products && withRatingArray(products, { page, limit }, count, filter)
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Fetch record by identifier
   * @param id Record identifier to be fetched
   * @param where If included, used sql where statement (javascript object syntax)
   */
  async fetchOne(id: string, where?: object): Promise<Product> {
    try {
      let product
      if (id) product = await this.productRepo.findOne({ where: { id }, relations: PRODUCT_RELATIONS })
      if (where) product = await this.productRepo.findOne({ where: where, relations: PRODUCT_RELATIONS })
      if (!product) throw new HttpException(RECORD_NOT_FOUND, HttpStatus.NOT_FOUND)

      // calculate average rating and add to product.ratingAverage
      if (product.rating?.length > 0) {
        return withRating(product)
      }

      return product
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Saves a record
   * @param _product DTO
   */
  async save(_product: CreateProductInput): Promise<Product> {
    try {
      const { imageArray, categoryId, brandId, ...rest } = _product

      const product = await this.productRepo.save({ ...rest, category: { id: categoryId }, brand: { id: brandId } })

      if (Array.isArray(imageArray)) {
        imageArray.map(async url => {
          await this.imageRepo.save({ url, product })
        })
        await this.productRepo.update({ id: product.id }, product)
      }

      return await this.productRepo.findOne({ where: { id: product.id }, relations: PRODUCT_RELATIONS })
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Updates record by identifier
   * @param id  Record identifier to be updated
   * @param product DTO
   */
  async update(id: string, product: UpdateProductInput): Promise<UpdateResult> {
    try {
      const foundProduct = await this.productRepo.findOne({ where: { id }, relations: PRODUCT_RELATIONS })
      if (!foundProduct) throw new HttpException(RECORD_NOT_FOUND, HttpStatus.NOT_FOUND)

      const { imageArray, categoryId, brandId, ...rest } = product

      if (Array.isArray(imageArray)) {
        imageArray.map(async url => {
          await this.imageRepo.save({ url, product: { id } })
        })
      }

      return await this.productRepo.update({ id }, { ...rest, category: { id: categoryId }, brand: { id: brandId } })
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Deletes a record by identifier
   * @param id Record identifier
   */
  async delete(id: string): Promise<DeleteResult> {
    try {
      const product: Product = await this.productRepo.findOne({ where: { id } })
      if (!product) throw new HttpException(RECORD_NOT_FOUND, HttpStatus.NOT_FOUND)

      return await this.productRepo.softDelete(id)
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
      const product = await this.productRepo.restore(id)
      if (!product) throw new HttpException(RECORD_NOT_FOUND, HttpStatus.NOT_FOUND)

      return product
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Fetches all brand records
   * @param where If included, used sql where statement (javascript object syntax)
   */
  async fetchBrands(where?: object): Promise<Brand[]> {
    try {
      return await this.brandRepo.find({ ...(where && { where }) })
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Fetches all category records
   * @param where If included, used sql where statement (javascript object syntax)
   */
  async fetchCategories(where?: object): Promise<Category[]> {
    try {
      return await this.categoryRepo.find({ ...(where && { where }) })
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Fetches all rating records
   * @param where If included, used sql where statement (javascript object syntax)
   */
  async fetchRatings(where?: object): Promise<Rating[]> {
    try {
      return await this.ratingRepo.find({ ...(where && { where }), relations: RATING_RELATIONS })
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Saves a rating record
   * @param ratingInput DTO
   * @param userId Owner of record
   */
  async saveRating(ratingInput: CreateRatingInput, userId: string): Promise<Rating> {
    try {
      const { productId, ...rest } = ratingInput

      const rating = await this.ratingRepo.save({ ...rest, user: { id: userId }, product: { id: productId } })

      return await this.ratingRepo.findOne({ where: { id: rating.id }, relations: RATING_RELATIONS })
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Returns all ram options (grouped)
   */
  async fetchRamOptions(): Promise<ProductRam[]> {
    try {
      const ramList = await this.dataSource
        .getRepository(Product)
        .createQueryBuilder('product')
        .select('product.ram')
        .groupBy('product.ram')
        .getRawMany()
      return ramList.map(ram => ({
        label: ram.product_ram + ' GB',
        value: ram.product_ram,
      }))
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Returns all storage options (grouped)
   */
  async fetchStorageOptions(): Promise<ProductStorage[]> {
    try {
      const storageList = await this.dataSource
        .getRepository(Product)
        .createQueryBuilder('product')
        .select('product.storage')
        .groupBy('product.storage')
        .getRawMany()
      return storageList.map(storage => ({
        label: storage.product_storage + ' GB',
        value: storage.product_storage,
      }))
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Inserts data into `product` table from `product.mock.ts`
   * Won't insert if data is found in table
   */
  async insertProducts(): Promise<any> {
    try {
      const products = await this.productRepo.find()
      if (products.length === 0) {
        // insert products
        await this.dataSource.createQueryBuilder().insert().into(Product).values(productMock).execute()

        // insert images
        productMock.map(product => {
          const { id, imageArray } = product

          if (Array.isArray(imageArray)) {
            imageArray.map(async url => {
              await this.imageRepo.save({ url, product: { id } })
            })
          }
        })
        return true
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Inserts data into `rating` table from `rating.mock.ts`
   * Won't insert if data is found in table
   */
  async insertRatings(): Promise<any> {
    try {
      const ratings = await this.ratingRepo.find()
      if (ratings.length <= 0) {
        return await this.dataSource.createQueryBuilder().insert().into(Rating).values(ratingMock).execute()
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Inserts data into `brand` table from `brand.mock.ts`
   * Won't insert if data is found in table
   */
  async insertBrands(): Promise<any> {
    try {
      const brands = await this.brandRepo.find()
      if (brands.length === 0) {
        return await this.dataSource.createQueryBuilder().insert().into(Brand).values(brandMock).execute()
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * Inserts data into `category` table from `category.mock.ts`
   * Won't insert if data is found in table
   */
  async insertCategories(): Promise<any> {
    try {
      const categories = await this.categoryRepo.find()
      if (categories.length === 0) {
        return await this.dataSource.createQueryBuilder().insert().into(Category).values(categoryMock).execute()
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
