import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {del, get, patch, post, requestBody, response} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {ShoppingCart, ShoppingCartItem} from '../models';
import {CartRepository, ProductRepository} from '../repositories';

export class CartController {
  constructor(
    @repository(CartRepository) public cartRepository: CartRepository,
    @repository(ProductRepository) public productRepository: ProductRepository,
  ) {}

  @authenticate('jwt')
  @get('cart')
  @response(200, {
    description: 'Add to cart',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': ShoppingCart,
        },
      },
    },
  })
  async getCart(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<ShoppingCart | null> {
    const userId = currentUserProfile[securityId];
    const cart = await this.cartRepository.findOne({
      where: {
        userId,
      },
    });
    return cart;
  }

  @authenticate('jwt')
  @post('cart/add2cart')
  @response(200, {
    description: 'Add to cart',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': ShoppingCartItem,
        },
      },
    },
  })
  async add2Cart(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody()
    item: {
      productId: string;
      quantity: number;
      optionId: string;
    },
  ): Promise<{status: string; items?: Partial<ShoppingCartItem>}> {
    if (item.quantity < 1) {
      return {
        status: 'failed',
      };
    }
    const userId = currentUserProfile[securityId];
    const cart = await this.cartRepository.findOne({
      where: {
        userId,
      },
    });
    const product = await this.productRepository.findById(item.productId);
    const optionItemCart = product.colorOptions?.find(
      color => (color.id = item.optionId),
    );
    if (!optionItemCart)
      return {
        status: 'failed',
      };
    const itemCart: Partial<ShoppingCartItem> = {
      productId: item.productId,
      name: product.name,
      quantity: item.quantity,
      slug: product.slug,
      option: optionItemCart,
    };
    if (!cart?.items) {
      const cart = await this.cartRepository.create({
        userId,
        items: [itemCart],
      });
      return {
        status: 'success',
        items: itemCart,
      };
    }
    cart.items.push(itemCart);
    await this.cartRepository.save(cart);
    return {
      status: 'success',
      items: itemCart,
    };
  }

  @authenticate('jwt')
  @patch('cart/quantity')
  @response(200, {
    description: 'Quantity item in cart',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': ShoppingCartItem,
        },
      },
    },
  })
  async quantity(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody()
    item: {
      productId: string;
      quantity: number;
      optionId: string;
    },
  ): Promise<{status: string; qty?: number}> {
    if (item.quantity < 1) {
      return {
        status: 'failed',
      };
    }
    const userId = currentUserProfile[securityId];
    const cart = await this.cartRepository.findOne({
      where: {
        userId,
      },
    });
    if (!cart?.items) {
      return {
        status: 'failed',
      };
    }
    const itemCartIndex = cart.items.findIndex(
      itemCart =>
        itemCart.productId === item.productId &&
        itemCart.option?.id === item.optionId,
    );
    if (itemCartIndex === -1) {
      return {
        status: 'failed',
      };
    }
    cart.items[itemCartIndex].quantity = item.quantity;
    await this.cartRepository.save(cart);
    return {
      status: 'success',
      qty: item.quantity,
    };
  }

  @authenticate('jwt')
  @patch('cart/updateSelect')
  @response(200, {
    description: 'Quantity item in cart',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': ShoppingCartItem,
        },
      },
    },
  })
  async updateSelect(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody()
    item: {
      productId?: string;
      selected: boolean;
      optionId?: string;
    },
  ): Promise<{status: string; selected?: boolean}> {
    const userId = currentUserProfile[securityId];
    const cart = await this.cartRepository.findOne({
      where: {
        userId,
      },
    });
    if (!cart?.items) {
      return {
        status: 'failed',
      };
    }
    if (!item.optionId && !item.productId) {
      cart.items.forEach(itemCart => {
        itemCart.selected = item.selected;
      });
      await this.cartRepository.save(cart);
      return {
        status: 'success',
        selected: item.selected,
      };
    }
    const itemCartIndex = cart.items.findIndex(
      itemCart =>
        itemCart.productId === item.productId &&
        itemCart.option?.id === item.optionId,
    );
    if (itemCartIndex === -1) {
      return {
        status: 'failed',
      };
    }
    cart.items[itemCartIndex].selected = item.selected;
    await this.cartRepository.save(cart);
    return {
      status: 'success',
      selected: item.selected,
    };
  }

  @authenticate('jwt')
  @del('cart/remove')
  @response(200, {
    description: 'Quantity item in cart',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': ShoppingCartItem,
        },
      },
    },
  })
  async removeCartItem(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody()
    item: {
      productId?: string;
      optionId?: string;
    },
  ): Promise<{status: string}> {
    const userId = currentUserProfile[securityId];
    const cart = await this.cartRepository.findOne({
      where: {
        userId,
      },
    });
    if (!cart?.items) {
      return {
        status: 'failed',
      };
    }
    if (!item.optionId && !item.productId) {
      cart.items = [];
      await this.cartRepository.save(cart);
      return {
        status: 'success',
      };
    }
    const removedItemCart = cart.items.filter(
      itemCart =>
        itemCart.productId !== item.productId ||
        itemCart.option?.id !== item.optionId,
    );
    cart.items = removedItemCart;
    await this.cartRepository.save(cart);
    return {
      status: 'success',
    };
  }
}
