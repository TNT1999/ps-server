import {Model, model, property} from '@loopback/repository';
import {nanoid} from 'nanoid';

@model()
export class VariantType extends Model {
  constructor(data?: Partial<VariantType>) {
    super(data);
  }
  @property({
    type: 'string',
    defaultFn: nanoid(),
  })
  id: string;

  @property()
  name: string;

  @property()
  slug: string;

  @property()
  price: string;

  @property()
  productId: string;

  // @hasOne(() => Product, {keyTo: 'variantsId'})
  // // @property()
  // product: Product;
}

export interface VariantTypeRelations {
  // describe navigational properties here
}

export type VariantTypeWithRelations = VariantType & VariantTypeRelations;
