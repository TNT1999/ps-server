import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {post, requestBody, response} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {Order} from '../models';
import {OrderRepository} from '../repositories';
import {ProductService, ProductServiceBindings} from '../services';

export class OrderController {
  constructor(
    @repository(OrderRepository) public orderRepository: OrderRepository,
    @inject(ProductServiceBindings.PRODUCT_SERVICE)
    public productService: ProductService,
  ) {}

  @authenticate('jwt')
  @post('order')
  @response(200, {
    description: 'Post order',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Order,
        },
      },
    },
  })
  async saveOrder(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody() order: Order,
  ): Promise<Order> {
    const userId = currentUserProfile[securityId];

    const savedOrder = await this.orderRepository.create(order);
    // decreate product with option color
    return savedOrder;
  }
}
