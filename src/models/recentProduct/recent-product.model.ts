import {belongsTo, Entity, model, property} from '@loopback/repository';
import {RecentProductItem, User} from '..';

@model({
  settings: {
    mongodb: {collection: 'RecentProduct'},
  },
})
export class RecentProduct extends Entity {
  constructor(data?: Partial<RecentProduct>) {
    super(data);
  }
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectId'},
  })
  id: string;

  @belongsTo(() => User, {name: 'user'})
  userId: string;

  @property.array(() => RecentProductItem)
  recentProduct?: RecentProductItem[];
}

export interface RecentProductRelations {
  // describe navigational properties here
}

export type RecentProductWithRelations = RecentProduct & RecentProductRelations;
