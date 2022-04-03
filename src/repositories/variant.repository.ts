import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Variant, VariantRelations} from '../models';

export class VariantRepository extends DefaultCrudRepository<
  Variant,
  typeof Variant.prototype.id,
  VariantRelations
> {
  // public readonly products: HasManyRepositoryFactory<
  //   Product,
  //   typeof Variant.prototype.id
  // >;
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    // @repository.getter('ProductRepository')
    // productRepositoryGetter: Getter<ProductRepository>,
  ) {
    super(Variant, dataSource);
    // this.products = this.createHasManyRepositoryFactoryFor(
    //   'products',
    //   productRepositoryGetter,
    // );
    // this.registerInclusionResolver('products', this.products.inclusionResolver);
  }
}
