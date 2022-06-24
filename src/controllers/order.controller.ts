/* eslint-disable @typescript-eslint/naming-convention */
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {FilterBuilder, repository} from '@loopback/repository';
import {get, param, patch, post, requestBody, response} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {ObjectId} from 'mongodb';
import {customAlphabet} from 'nanoid';
import {Order, OrderItem, OrderStatus} from '../models';
import {OrderRepository} from '../repositories';
import {
  ProductService,
  ProductServiceBindings,
  ShippingService,
  ShippingServiceBindings,
} from '../services';

export class OrderController {
  constructor(
    @repository(OrderRepository) public orderRepository: OrderRepository,
    @inject(ProductServiceBindings.PRODUCT_SERVICE)
    public productService: ProductService,
    @inject(ShippingServiceBindings.SHIPPING_SERVICE)
    public shippingService: ShippingService,
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

    const nanoid = customAlphabet('0123456789', 10);
    const orderId = nanoid(12);
    // generate id for order product item
    order.products.map((product: OrderItem) => {
      product.id = nanoid(8);
      return product;
    });
    const savedOrder = await this.orderRepository.create({
      // products: body.products,
      ...order,
      orderId,
      userId,
    });
    // const savedOrder = await this.orderRepository.create(order);
    // decreate product with option color
    return savedOrder;
  }

  @authenticate('jwt')
  @get('orders')
  @response(200, {
    description: 'Get orders for users',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            'x-ts-type': Order,
          },
        },
      },
    },
  })
  async getOrders(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.query.string('status') status: string,
  ) {
    const userId = currentUserProfile[securityId];
    const orders = await this.orderRepository.find({
      where: {
        userId,
        orderStatus: status,
      },
    });
    return orders;
  }

  @authenticate('jwt')
  @get('origin/orders')
  @response(200, {
    description: 'Get orders for admin',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            'x-ts-type': Order,
          },
        },
      },
    },
  })
  async getAllOrders(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.query.number('page') page: number,
  ) {
    if (page <= 0) {
      return [];
    }
    const filterBuilder = new FilterBuilder<Order>();
    const OrderPerPage = 10;
    const filter = filterBuilder
      .where({})
      .limit(OrderPerPage)
      .offset((page - 1) * OrderPerPage)
      .order('createdAt DESC')
      .fields({
        shippingAddress: false,
        shippingInfo: false,
      })
      .build();
    const result: Order[] = await this.orderRepository.find(filter);
    return result;
  }

  @authenticate('jwt')
  @get('order/{id}')
  @response(200, {
    description: 'Get order',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            'x-ts-type': Order,
          },
        },
      },
    },
  })
  async getOrder(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.path.string('id') orderId: string,
  ) {
    const userId = currentUserProfile[securityId];
    const order = await this.orderRepository.findOne({
      where: {
        userId,
        orderId,
      },
    });
    return order;
  }
  @authenticate('jwt')
  @authorize({allowedRoles: ['admin']})
  @patch('order/success/{id}')
  @response(200, {
    description: 'Make order finish delivery',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async finishDelivery(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.path.string('id') orderId: string,
  ) {
    // const userId = currentUserProfile[securityId];
    try {
      await this.orderRepository.execute(
        'Order',
        'findOneAndUpdate',
        {orderId},
        {
          $set: {
            'shippingInfo.deliveredAt': new Date(),
            orderStatus: OrderStatus.SUCCESS,
          },
        },
      );
      return {
        status: 'success',
      };
    } catch (e) {
      return {
        status: 'failure',
      };
    }
  }

  @authenticate('jwt')
  @patch('order/shipping/{id}')
  @response(200, {
    description: 'Make order shipping delivery',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async startDelivery(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.path.string('id') orderId: string,
  ) {
    const userId = currentUserProfile[securityId];
    try {
      await this.orderRepository.execute(
        'Order',
        'findOneAndUpdate',
        {userId: new ObjectId(userId), orderId},
        {
          $set: {
            'shippingInfo.shippingAt': new Date(),
            orderStatus: OrderStatus.SHIPPING,
          },
        },
      );
      return {
        status: 'success',
      };
    } catch (e) {
      return {
        status: 'failure',
      };
    }
  }

  @authenticate('jwt')
  @patch('order/cancel/{id}')
  @response(200, {
    description: 'Cancel order',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async cancelOrder(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.path.string('id') orderId: string,
  ) {
    const userId = currentUserProfile[securityId];
    try {
      await this.orderRepository.execute(
        'Order',
        'findOneAndUpdate',
        {userId: new ObjectId(userId), orderId},
        {
          $set: {
            orderStatus: OrderStatus.CANCELED,
          },
        },
      );
      return {
        status: 'success',
      };
    } catch (e) {
      return {
        status: 'failure',
      };
    }
  }

  @authenticate('jwt')
  @post('order/shipping')
  @response(200, {
    description: 'Get shipping free',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Order,
        },
      },
    },
  })
  async shippingFee(
    @requestBody()
    shippingInfo: {
      storeId: number;
      to_district: number;
      to_ward: string;
    },
  ) {
    try {
      const available_services = await this.shippingService.getService({
        from_district: 3695, //thu duc
        to_district: shippingInfo.to_district,
      });
      const promises = available_services.map(service => {
        const expected_time = this.shippingService.getExpectedTime({
          from_district_id: 3695, // thu duc
          from_ward_code: '90765', // an phu
          service_id: service.service_id,
          service_type_id: null,
          to_district_id: shippingInfo.to_district,
          to_ward_code: shippingInfo.to_ward,
        });
        const shipping_fee = this.shippingService.getShippingFee({
          from_district_id: 1442, //q1
          to_district_id: shippingInfo.to_district,
          to_ward_code: shippingInfo.to_ward,
          service_id: service.service_id,
          service_type_id: null,
          height: 10,
          length: 20,
          weight: 500,
          width: 10,
          insurance_value: 10000,
          coupon: null,
        });
        return Promise.all([shipping_fee, expected_time, service]);
      });
      const result = await Promise.all(promises);
      const transformResult = result.map(serviceResult => {
        return {
          ...serviceResult[0],
          ...serviceResult[1],
          ...serviceResult[2],
        };
      });
      return transformResult;
    } catch (e) {
      console.log(e);
    }
  }
}
