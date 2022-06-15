import {
  belongsTo,
  Entity,
  hasMany,
  model,
  property,
} from '@loopback/repository';
import {
  AttributeProduct,
  ColorOptionProduct,
  Comment,
  CommentWithRelations,
  ProductFields,
  Review,
  Variant,
  VariantWithRelations,
} from '..';
import {ReviewWithRelations} from '../review/review.model';

enum AttrsProduct {
  HANG_SX = 'Hãng sản xuất',
  BO_NHO = 'Bộ nhớ',
}

// export enum ProductFields {
//   RAM_GB = 'ram_gb',
//   STORAGE_GB = 'storage_gb',
//   STORAGE_TB = 'storage_tb',
//   DISPLAY_SIZE_INCHES = 'display_size_inches',
//   BRAND = 'brand',
//   PRICE = 'price',
// }

@model({
  settings: {
    mongodb: {
      collection: 'Products',
    },
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
  slug: string;

  @property()
  name: string;

  @property()
  lname: string;

  @property({
    type: 'number',
    default: 0,
  })
  reviewCount?: number;

  @property()
  thumbnail: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isHot?: boolean;

  @property.array(() => AttributeProduct)
  attrs?: AttributeProduct[];

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  createdAt?: 'date';

  @property({
    type: 'date',
  })
  updatedAt?: 'date';

  @property({
    type: 'number',
    default: 0,
    jsonSchema: {
      maximum: 5,
      minimum: 0,
    },
  })
  ratingValue?: number;

  @property({
    type: 'boolean',
    default: false,
  })
  hasVariants: boolean;

  @property()
  price: number;

  @property({
    type: 'number',
    default: 0,
  })
  discount?: number;

  @property({
    type: 'boolean',
    default: false,
  })
  isMainProduct?: boolean;

  @property({
    type: 'object',
  })
  productFields: ProductFields;

  @property.array(() => ColorOptionProduct)
  colorOptions: ColorOptionProduct[];

  @belongsTo(() => Variant, {name: 'variants'})
  variantsId?: string;

  @hasMany(() => Comment, {keyTo: 'productId', name: 'comments'})
  comments?: Comment[];

  @hasMany(() => Review, {keyTo: 'productId', name: 'reviews'})
  reviews?: Review[];
}

export interface ProductRelations {
  comments?: CommentWithRelations[];
  variants?: VariantWithRelations;
  reviews?: ReviewWithRelations[];
  // describe navigational properties here
}

export type ProductWithRelations = Product & ProductRelations;
