import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {VariantRepository} from '.';
import {MongodbDataSource} from '../datasources';
import {Product, ProductRelations, Variant} from '../models';

export class ProductRepository extends DefaultCrudRepository<
  Product,
  typeof Product.prototype.id,
  ProductRelations
> {
  public readonly variant: BelongsToAccessor<
    Variant,
    typeof Product.prototype.id
  >;
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('VariantRepository')
    variantRepositoryGetter: Getter<VariantRepository>,
  ) {
    super(Product, dataSource);
    this.variant = this.createBelongsToAccessorFor(
      'variant',
      variantRepositoryGetter,
    );
  }
}
