import {
  belongsTo,
  Entity,
  hasMany,
  model,
  property,
} from '@loopback/repository';
import {User} from '.';

@model({
  settings: {
    mongodb: {collection: 'Comments'},
  },
})
export class Comment extends Entity {
  constructor(data?: Partial<Comment>) {
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
  author: object;

  @property({
    type: 'number',
    default: 0,
  })
  level: number;

  @property()
  content: string;

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

  @property({
    type: 'string',
    default: null,
  })
  replyToCommentId?: string;

  @property({
    type: 'string',
    default: null,
  })
  replyToUser?: string;

  @property({
    type: 'string',
    default: null,
  })
  rootCommentId?: string;

  @hasMany(() => Comment, {keyTo: 'rootCommentId', name: 'replies'})
  replies?: Comment[];
}

export interface CommentRelations {
  // describe navigational properties here
  replies: CommentWithRelations[];
}

export type CommentWithRelations = Comment & CommentRelations;
