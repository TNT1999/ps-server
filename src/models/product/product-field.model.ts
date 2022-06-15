/* eslint-disable @typescript-eslint/naming-convention */
import {Model, model, property} from '@loopback/repository';

@model({
  settings: {
    strict: false,
  },
})
export class ProductFields extends Model {
  constructor(data?: Partial<ProductFields>) {
    super(data);
  }
  @property()
  ram_gb: number;

  @property()
  storage_gb: number;

  @property()
  storage_tb: number;

  @property()
  display_size_inches: number;

  @property()
  price: number;

  @property()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  brand: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;
}

export interface ProductFieldsRelations {
  // describe navigational properties here
}

export type ProductFieldsWithRelations = ProductFields & ProductFieldsRelations;
