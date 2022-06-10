import {model, Model, property} from '@loopback/repository';
import {ColorOptionProduct} from '..';

/**
 * Item in a shopping cart
 */
@model()
export class ShoppingCartItem extends Model {
  /**
   * Product id
   */
  @property()
  id: string;

  @property({
    type: 'string',
  })
  productId: string;
  /**
   * Product name
   */
  @property()
  name: string;

  /**
   * Quantity
   */
  @property()
  quantity: number;
  /**
   * Slug
   */
  @property()
  slug: string;

  @property({
    default: false,
  })
  selected: boolean;

  @property()
  discount: number;

  @property({
    type: 'object',
  })
  option: ColorOptionProduct;

  constructor(data?: Partial<ShoppingCartItem>) {
    super(data);
  }
}
