import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Variant, VariantRelations} from '../models';

export class VariantRepository extends DefaultCrudRepository<
  Variant,
  typeof Variant.prototype.id,
  VariantRelations
> {
  constructor(@inject('datasources.mongodb') dataSource: MongodbDataSource) {
    super(Variant, dataSource);
  }
}
