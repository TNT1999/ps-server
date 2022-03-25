import {Model, model, property} from '@loopback/repository';

@model()
export class AttributeProduct extends Model {
  constructor(data?: Partial<AttributeProduct>) {
    super(data);
  }
  @property()
  name: string;

  @property()
  value: string;
}

export interface AttributeProductRelations {
  // describe navigational properties here
}

export type AttributeProductWithRelations = AttributeProduct &
  AttributeProductRelations;
