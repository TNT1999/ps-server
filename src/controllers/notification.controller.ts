import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, param, post, requestBody, response} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {Notifications, Order} from '../models';
import {NotificationRepository, OrderRepository} from '../repositories';

export class OrderController {
  constructor(
    @repository(OrderRepository)
    public notificationRepository: NotificationRepository,
  ) {}

  @authenticate('jwt')
  @post('notification')
  @response(200, {
    description: 'Post Notification',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Notifications,
        },
      },
    },
  })
  async createNotification(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody() notification: Notifications,
  ): Promise<Notifications> {
    const userId = currentUserProfile[securityId];
    const saveNoti = await this.notificationRepository.create({
      ...notification,
      userId,
    });
    // const savedOrder = await this.orderRepository.create(order);
    // decreate product with option color
    return saveNoti;
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
    const orders = await this.notificationRepository.find({
      where: {
        userId,
      },
    });
    return orders;
  }
}
