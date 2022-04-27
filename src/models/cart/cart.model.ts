import {belongsTo, Entity, model, property} from '@loopback/repository';
import {ShoppingCartItem, User, UserWithRelations} from '..';

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
}

export interface ShoppingCartRelations {
  // describe navigational properties here
  user?: UserWithRelations;
}

export type ShoppingCartWithRelations = ShoppingCart & ShoppingCartRelations;
