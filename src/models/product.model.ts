import {Entity, model, property} from '@loopback/repository';

enum AttrsProduct {
  HANG_SX = 'Hãng sản xuất',
  BO_NHO = 'Bộ nhớ',
}

enum ProductFields {
  RAM_GB,
  STORAGE_GB,
  STORAGE_TB,
  DISPLAY_SIZE_INCHES,
  BRAND,
  PRICE,
}

@model({
  settings: {
    mongodb: {collection: 'Products'},
  },
})
export class Product extends Entity {
  constructor(data?: Partial<Product>) {
    super(data);
  }
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectId'},
  })
  id: string;

  @property({
    type: 'string',
    index: true,
  })
  slug?: string;

  @property()
  name?: string;

  @property()
  lname?: string;

  @property({
    type: 'number',
    index: true,
  })
  reviewCount?: number;

  @property()
  thumbnail?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isHot?: boolean;

  @property({
    type: 'object',
    jsonSchema: {
      anyOf: Object(AttrsProduct),
    },
  })
  attrs?: {
    [key in AttrsProduct]: string;
  };

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  createdAt?: 'date';

  @property()
  ratingValue?: number;

  @property({
    type: 'boolean',
    default: false,
  })
  hasVariants?: boolean;

  @property()
  price?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isMainProduct?: boolean;

  @property({
    type: 'object',
    jsonSchema: {
      anyOf: Object(ProductFields),
    },
  })
  productFields?: object;
}

export interface ProductRelations {
  // describe navigational properties here
}

export type ProductWithRelations = Product & ProductRelations;
