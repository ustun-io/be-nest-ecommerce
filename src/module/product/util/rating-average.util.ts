import { FilterArgs } from '@module/product/dto/filter.args'
import { Product, ProductsFetchResponse } from '@module/product/model/product.entity'
import { Rating } from '@module/product/model/rating.entity'

import { PaginationArgs } from '@shared/model/pagination.args'

export const withRating = (product: Product): Product => {
  let ratingTotal = 0
  const ratingCount = Array.isArray(product.rating) && product.rating.length

  product.rating.map((rating: Rating) => {
    ratingTotal = rating.star + ratingTotal
  })
  product.ratingAverage = ratingTotal / ratingCount

  return product
}

export const withRatingArray = (
  products: Product[],
  paginationArgs: PaginationArgs,
  count: number,
  filter?: FilterArgs,
): ProductsFetchResponse => {
  products.map((product: Product, i: number) => {
    if (product.rating?.length > 0) {
      const ratingCount = Array.isArray(products[i].rating) && products[i].rating.length
      let ratingTotal = 0
      products[i].rating.map((rating: Rating) => {
        ratingTotal = rating.star + ratingTotal
      })
      products[i].ratingAverage = ratingTotal / ratingCount
    }
  })
  return {
    data: products,
    page: paginationArgs.page,
    limit: paginationArgs.limit,
    count,
    filter,
  }
}
