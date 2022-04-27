import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Reviewer, User} from '..';

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
  reviewer: Reviewer;

  @property({
    type: 'string',
    jsonSchema: {
      minLength: 30,
    },
  })
  content: string;

  @property({
    type: 'number',
    jsonSchema: {
      maximum: 5,
      minimum: 0,
      errorMessage: 'Value should be more than 0 and less than 5',
    },
  })
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
