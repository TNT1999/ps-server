import {Entity, hasMany, model, property} from '@loopback/repository';
import {Product} from './product.model';

export class VariantType {
  name: string;
  price: string;
  slug: string;
  product: Product;
}

@model({
  settings: {
    mongodb: {collection: 'Variants'},
  },
})
export class Variant extends Entity {
  constructor(data?: Partial<Variant>) {
    super(data);
  }
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectId'},
  })
  id: string;

  @hasMany(() => Product, {keyTo: 'variantsId'})
  variants?: VariantType[];
}

export interface VariantRelations {
  // describe navigational properties here
  variants?: VariantWithRelations;
}

export type VariantWithRelations = Variant & VariantRelations;
