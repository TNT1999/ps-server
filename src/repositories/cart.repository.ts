import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {UserRepository} from '.';
import {MongodbDataSource} from '../datasources';
import {ShoppingCart, ShoppingCartRelations, User} from '../models';

export class CartRepository extends DefaultCrudRepository<
  ShoppingCart,
  typeof ShoppingCart.prototype.id,
  ShoppingCartRelations
> {
  public readonly user: BelongsToAccessor<
    User,
    typeof ShoppingCart.prototype.id
  >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('CustomerRepository')
    userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(ShoppingCart, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
  }
}
