import {Model, model, property} from '@loopback/repository';

@model()
export class OrderItemOption extends Model {
  constructor(data?: Partial<OrderItemOption>) {
    super(data);
  }
  @property({
    type: 'string',
  })
  id: string;

  @property()
  name: string;

  @property()
  price: string;

  // amount in stock when buy
  @property()
  amount: string;

  @property()
  images: string[];
}

export interface OrderItemOptionRelations {
  // describe navigational properties here
}

export type OrderItemOptionWithRelations = OrderItemOption &
  OrderItemOptionRelations;
