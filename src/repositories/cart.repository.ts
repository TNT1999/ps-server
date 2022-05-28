import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {AddressRepository, UserRepository} from '.';
import {MongodbDataSource} from '../datasources';
import {Address, ShoppingCart, ShoppingCartRelations, User} from '../models';

export class CartRepository extends DefaultCrudRepository<
  ShoppingCart,
  typeof ShoppingCart.prototype.id,
  ShoppingCartRelations
> {
  public readonly user: BelongsToAccessor<
    User,
    typeof ShoppingCart.prototype.id
  >;

  public readonly shippingAddress: BelongsToAccessor<
    Address,
    typeof ShoppingCart.prototype.id
  >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('CustomerRepository')
    userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('AddressRepository')
    addressRepository: Getter<AddressRepository>,
  ) {
    super(ShoppingCart, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.shippingAddress = this.createBelongsToAccessorFor(
      'shippingAddress',
      addressRepository,
    );
    this.registerInclusionResolver(
      'shippingAddress',
      this.shippingAddress.inclusionResolver,
    );
  }
}
