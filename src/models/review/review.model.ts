import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '..';

@model({
  settings: {
    mongodb: {collection: 'Reviews'},
  },
})
export class Review extends Entity {
  constructor(data?: Partial<Review>) {
    super(data);
  }
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectId'},
  })
  id: string;

  @property()
  productId: string;

  @property()
  slug: string;

  @belongsTo(() => User, {name: 'user'})
  userId: string;

  @property({
    type: 'object',
  })
  reviewer: object;

  @property({
    type: 'string',
    jsonSchema: {
      minLength: 30,
    },
  })
  content: string;

  @property()
  reviewValue: number;

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  createdAt?: 'date';

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  updatedAt?: 'date';

  @property({
    type: 'date',
    default: null,
  })
  deletedAt?: 'date';
}

export interface ReviewRelations {
  // describe navigational properties here
}

export type ReviewWithRelations = Review & ReviewRelations;
