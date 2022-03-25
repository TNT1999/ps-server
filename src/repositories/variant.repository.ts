import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {ProductRepository} from '.';
import {MongodbDataSource} from '../datasources';
import {Product, User, Variant, VariantRelations} from '../models';

export class VariantRepository extends DefaultCrudRepository<
  Variant,
  typeof Variant.prototype.id,
  VariantRelations
> {
  public readonly products: HasManyRepositoryFactory<
    Product,
    typeof Variant.prototype.id
  >;
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('ProductRepository')
    productRepositoryGetter: Getter<ProductRepository>,
  ) {
    super(User, dataSource);
    this.products = this.createHasManyRepositoryFactoryFor(
      'products',
      productRepositoryGetter,
    );
  }
}
