import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Comment, CommentRelations} from '../models';

export class CommentRepository extends DefaultCrudRepository<
  Comment,
  typeof Comment.prototype.id,
  CommentRelations
> {
  public readonly replies: HasManyRepositoryFactory<
    Comment,
    typeof Comment.prototype.id
  >;

  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(Comment, dataSource);
    this.replies = this.createHasManyRepositoryFactoryFor(
      'replies',
      Getter.fromValue(this), // circular dependency
    );
    this.registerInclusionResolver('replies', this.replies.inclusionResolver);
  }
}
