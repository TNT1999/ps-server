import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {CommentRepository, VariantRepository} from '.';
import {MongodbDataSource} from '../datasources';
import {Comment, Product, ProductRelations, Variant} from '../models';

export class ProductRepository extends DefaultCrudRepository<
  Product,
  typeof Product.prototype.id,
  ProductRelations
> {
  public readonly variants: BelongsToAccessor<
    Variant,
    typeof Product.prototype.id
  >;
  public readonly comments: HasManyRepositoryFactory<
    Comment,
    typeof Product.prototype.id
  >;
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('VariantRepository')
    variantRepositoryGetter: Getter<VariantRepository>,
    @repository.getter('CommentRepository')
    commentRepositoryGetter: Getter<CommentRepository>,
  ) {
    super(Product, dataSource);
    this.variants = this.createBelongsToAccessorFor(
      'variants',
      variantRepositoryGetter,
    );
    this.registerInclusionResolver('variants', this.variants.inclusionResolver);
    this.comments = this.createHasManyRepositoryFactoryFor(
      'comments',
      commentRepositoryGetter,
    );
    this.registerInclusionResolver('comments', this.comments.inclusionResolver);
  }
}
