import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    mongodb: {collection: 'brands'},
  },
})
export class Brand extends Entity {
  constructor(data?: Partial<Brand>) {
    super(data);
  }
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectId'},
  })
  id: string;

  @property()
  name: string;
}

export interface BrandRelations {
  // describe navigational properties here
}

export type BrandWithRelations = Brand & BrandRelations;
