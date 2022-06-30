import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum NotificationType {
  ORDER = 'order',
  QUESTION = 'question',
}
@model({
  settings: {
    mongodb: {collection: 'Notifications'},
  },
})
export class Notifications extends Entity {
  constructor(data?: Partial<Notifications>) {
    super(data);
  }
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectId'},
  })
  id: string;

  @property()
  name: string;

  @belongsTo(() => User, {name: 'user'})
  userId: string;

  @property()
  link: string;

  @property()
  content: string;

  @property({
    default: true,
  })
  unread: boolean;

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  createdAt?: 'date';

  @property({
    type: 'string',
    default: NotificationType.ORDER,
    jsonSchema: {
      enum: Object.values(NotificationType),
    },
  })
  type?: string;
}

export interface NotificationsRelations {
  // describe navigational properties here
}

export type NotificationsWithRelations = Notifications & NotificationsRelations;
