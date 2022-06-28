import {belongsTo, Entity, model, property} from '@loopback/repository';
import {OrderItem, User, UserWithRelations} from '..';

export enum OrderStatus {
  WAIT_CONFIRMED = 'wait_confirm',
  PROCESSING = 'processing',
  SHIPPING = 'shipping',
  SUCCESS = 'success',
  CANCELED = 'cancel',
}

export enum PaymentType {
  COD = 'cod',
  VNP = 'vnp',
  Paypal = 'paypal',
}
export enum PaymentStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PROCESSING = 'processing',
}
@model({
  settings: {
    mongodb: {collection: 'Orders'},
    // hiddenProperties: ['userId'],
  },
})
export class Order extends Entity {
  constructor(data?: Partial<Order>) {
    super(data);
  }
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectId'},
  })
  id: string;

  @belongsTo(() => User, {name: 'user'})
  userId?: string;

  @property()
  orderId: string;

  @property({
    type: 'string',
    default: OrderStatus.WAIT_CONFIRMED,
    jsonSchema: {
      enum: Object.values(OrderStatus),
    },
  })
  orderStatus?: string;

  @property()
  finalTotal: number;

  @property({
    type: 'object',
  })
  shippingInfo: object;

  @property({
    type: 'object',
  })
  shippingAddress: object;

  @property({
    type: 'string',
    default: PaymentStatus.PROCESSING,
    jsonSchema: {
      enum: Object.values(PaymentStatus),
    },
  })
  paymentStatus?: string;

  @property.array(() => OrderItem)
  products: OrderItem[];

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  createdAt?: 'date';

  @property({
    type: 'string',
    default: PaymentType.COD,
    jsonSchema: {
      enum: Object.values(PaymentType),
    },
  })
  paymentType?: string;
}

export interface OrderRelations {
  // describe navigational properties here
  user?: UserWithRelations;
}

export type OrderWithRelations = Order & OrderRelations;
