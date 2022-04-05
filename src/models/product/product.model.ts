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
  Review,
  Variant,
  VariantWithRelations,
} from '..';
import {ReviewWithRelations} from '../review/review.model';

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
  })
  reviewCount?: number;

  @property()
  thumbnail?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isHot?: boolean;

  @property.array(AttributeProduct)
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

  @property()
  ratingValue?: number;

  @property({
    type: 'boolean',
    default: false,
  })
  hasVariants?: boolean;

  @property()
  price?: string;

  @property()
  discount?: number;

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

  @property.array(ColorOptionProduct)
  colorOptions?: ColorOptionProduct[];

  @belongsTo(() => Variant, {name: 'variants'})
  variantsId?: string;

  @hasMany(() => Comment, {keyTo: 'productId'})
  comments?: Comment[];

  @hasMany(() => Review, {keyTo: 'productId'})
  reviews?: Review[];
}

export interface ProductRelations {
  comments?: CommentWithRelations[];
  variants?: VariantWithRelations;
  reviews?: ReviewWithRelations[];
  // describe navigational properties here
}

export type ProductWithRelations = Product & ProductRelations;
