import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {UserRepository} from '.';
import {MongodbDataSource} from '../datasources';
import {Notifications, NotificationsRelations, User} from '../models';

export class NotificationRepository extends DefaultCrudRepository<
  Notifications,
  typeof Notifications.prototype.id,
  NotificationsRelations
> {
  public readonly user: BelongsToAccessor<
    User,
    typeof Notifications.prototype.id
  >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('CustomerRepository')
    userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Notifications, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
  }
}
