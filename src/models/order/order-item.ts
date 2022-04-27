import {Model, model, property} from '@loopback/repository';
import {ColorOptionProduct} from '..';

@model()
export class OrderItem extends Model {
  constructor(data?: Partial<OrderItem>) {
    super(data);
  }
  @property({
    type: 'string',
  })
  id: string;

  @property()
  name: string;

  @property()
  slug: string;

  @property()
  quantity: number;

  @property({
    type: 'object',
  })
  option: ColorOptionProduct;
}

export interface OrderItemRelations {
  // describe navigational properties here
}

export type OrderItemWithRelations = OrderItem & OrderItemRelations;
