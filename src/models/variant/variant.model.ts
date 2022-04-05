import {Entity, model, property} from '@loopback/repository';
import {VariantType} from '..';
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

  @property.array(() => VariantType)
  variants?: VariantType[];
}

export interface VariantRelations {
  // describe navigational properties here
  // variants?: VariantWithRelations;
}

export type VariantWithRelations = Variant & VariantRelations;
