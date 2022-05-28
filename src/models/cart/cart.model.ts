import {belongsTo, Entity, model, property} from '@loopback/repository';
import {
  Address,
  AddressWithRelations,
  ShoppingCartItem,
  User,
  UserWithRelations,
} from '..';

@model({
  settings: {
    mongodb: {collection: 'Carts'},
  },
})
export class ShoppingCart extends Entity {
  constructor(data?: Partial<ShoppingCart>) {
    super(data);
  }
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectId'},
  })
  id: string;

  @belongsTo(() => User, {name: 'user'})
  userId: string;
  /**
   * Items in the shopping cart
   */
  @property.array(() => ShoppingCartItem)
  items?: Partial<ShoppingCartItem>[];

  @belongsTo(() => Address, {name: 'shippingAddress'})
  shippingAddressId: string;
}

export interface ShoppingCartRelations {
  // describe navigational properties here
  user?: UserWithRelations;
  shippingAddress: AddressWithRelations;
}

export type ShoppingCartWithRelations = ShoppingCart & ShoppingCartRelations;
