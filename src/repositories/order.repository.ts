import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {UserRepository} from '.';
import {MongodbDataSource} from '../datasources';
import {Order, OrderRelations, User} from '../models';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id,
  OrderRelations
> {
  public readonly user: BelongsToAccessor<User, typeof Order.prototype.id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('CustomerRepository')
    userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Order, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
  }
}
