import { SetMetadata } from '@nestjs/common'

export const HAS_PRODUCT_KEY = 'hasProduct'

export const HasProduct = (product: string) => SetMetadata(HAS_PRODUCT_KEY, product)
