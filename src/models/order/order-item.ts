import {Model, model, property} from '@loopback/repository';
import {ColorOptionProduct} from '..';

@model()
export class OrderItem extends Model {
  constructor(data?: Partial<OrderItem>) {
    super(data);
  }
  @property()
  id: string;

  @property()
  name: string;

  @property()
  productId: string;

  @property()
  slug: string;

  @property()
  quantity: number;

  @property()
  discount: number;

  @property({
    type: 'object',
  })
  option: ColorOptionProduct;

  @property({
    type: 'boolean',
    default: false,
  })
  reviewed: boolean;
}

export interface OrderItemRelations {
  // describe navigational properties here
}

export type OrderItemWithRelations = OrderItem & OrderItemRelations;
