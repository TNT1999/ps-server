import {Model, model, property} from '@loopback/repository';
import {nanoid} from 'nanoid';

@model()
export class ColorOptionProduct extends Model {
  constructor(data?: Partial<ColorOptionProduct>) {
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
  amount: string;

  @property()
  price: string;

  @property.array(String)
  images: string[];
}

export interface ColorOptionProductRelations {
  // describe navigational properties here
}

export type ColorOptionProductWithRelations = ColorOptionProduct &
  ColorOptionProductRelations;
