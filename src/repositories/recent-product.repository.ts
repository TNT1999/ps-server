import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {RecentProduct} from '../models';

export class RecentProductRepository extends DefaultCrudRepository<
  RecentProduct,
  typeof RecentProduct.prototype.id,
  RecentProduct
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(RecentProduct, dataSource);
  }
}
