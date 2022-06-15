import {Model, model, property} from '@loopback/repository';

@model({
  settings: {
    strict: false,
  },
})
export class AttributeProduct extends Model {
  constructor(data?: Partial<AttributeProduct>) {
    super(data);
  }
  @property()
  name: string;

  @property()
  value: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;
}

export interface AttributeProductRelations {
  // describe navigational properties here
}

export type AttributeProductWithRelations = AttributeProduct &
  AttributeProductRelations;
