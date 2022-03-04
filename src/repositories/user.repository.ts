import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {OrderRepository} from '.';
import {MongodbDataSource} from '../datasources';
import {Order, User, UserRelations} from '../models';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  public readonly orders: HasManyRepositoryFactory<
    Order,
    typeof User.prototype.id
  >;
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('OrderRepository')
    orderRepositoryGetter: Getter<OrderRepository>,
  ) {
    super(User, dataSource);
    this.orders = this.createHasManyRepositoryFactoryFor(
      'orders',
      orderRepositoryGetter,
    );
  }
}
