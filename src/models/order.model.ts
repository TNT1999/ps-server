import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Product, User, UserWithRelations} from '.';

enum OrderStatus {
  UN_CONFIRMED = 'Chưa xác nhận',
  CANCELED = 'Đã huỷ',
}

enum PaymentType {
  COD = 'cod',
  VNP = 'vnp',
  Paypal = 'paypal',
  Momo = 'momo',
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

  @belongsTo(() => User)
  // @property({
  //   type: 'string',
  //   mongodb: {dataType: 'ObjectId'},
  // })
  userId?: string;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(OrderStatus),
    },
  })
  orderStatus?: string;

  @property()
  totalAmount: number;

  @property()
  payment?: string;

  @property({
    type: 'object',
  })
  products?: Product[];

  @property({
    type: 'boolean',
    default: false,
  })
  isHot?: boolean;

  @property({
    type: 'object',
  })
  attrs?: object;

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  createdAt?: 'date';

  @property()
  ratingValue?: number;

  @property({
    type: 'boolean',
    default: false,
  })
  hasVariants?: boolean;

  @property()
  price?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isMainProduct?: boolean;

  @property({
    type: 'string',
    default: PaymentType.COD,
    jsonSchema: {
      enum: Object.values(PaymentType),
    },
  })
  paymentType?: object;
}

export interface OrderRelations {
  // describe navigational properties here
  user?: UserWithRelations;
}

export type OrderWithRelations = Order & OrderRelations;
