import {belongsTo, Entity, model, property} from '@loopback/repository';
import {OrderItem, User, UserWithRelations} from '..';

export enum OrderStatus {
  WAIT_CONFIRMED = 'Chờ xác nhận',
  PROCESSING = 'Đang xử lý',
  SHIPPING = 'Đang giao hàng',
  SUCCESS = 'Giao hàng thành công',
  CANCELED = 'Đã huỷ',
}

export enum PaymentType {
  COD = 'cod',
  VNP = 'vnp',
  Paypal = 'paypal',
}
export enum PaymentStatus {
  SUCCESS = 'Thành công',
  FAILURE = 'Thất bại',
  PROCESSING = 'Đang xử lý',
}
@model({
  settings: {
    mongodb: {collection: 'Orders'},
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

  @property({
    type: 'string',
    default: OrderStatus.WAIT_CONFIRMED,
    jsonSchema: {
      enum: Object.values(OrderStatus),
    },
  })
  orderStatus?: string;

  @property()
  totalAmount: number;

  @property()
  shippingFee: number;

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
