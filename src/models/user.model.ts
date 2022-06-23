import {Entity, hasMany, model, property} from '@loopback/repository';
import {Order} from '.';

export enum ROLES {
  USER = 'user',
  ADMIN = 'admin',
}

@model({
  settings: {
    mongodb: {collection: 'Users'},
    hiddenProperties: [
      'password',
      // 'createdAt',
      'facebookUserId',
      'googleUserId',
      'resetPasswordToken',
    ],
    // scope: {
    //   where: {isActive: false},
    // },
  },
})
export class User extends Entity {
  constructor(data?: Partial<User>) {
    super(data);
  }
  @property({
    type: 'string',
    id: true,
    mongodb: {dataType: 'ObjectId'},
  })
  id: string;

  @property({
    type: 'string',
    index: true,
    jsonSchema: {
      pattern: '\\d+',
    },
  })
  phone?: string;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
    index: true,
    jsonSchema: {
      format: 'email',
      errorMessage: {
        format: 'Email is invalid',
      },
    },
  })
  email?: string;

  @property({
    type: 'string',
  })
  facebookUserId?: string;

  @property({
    type: 'string',
  })
  googleUserId?: string;

  @property({
    type: 'string',
    require: true,
    hidden: true,
    jsonSchema: {
      minLength: 6,
      maxLength: 512,
      errorMessage:
        'Password should be more than 6 and less than 512 characters',
    },
  })
  password?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isActive?: boolean;

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  createdAt?: 'date';

  @property({
    type: 'string',
    default: undefined,
  })
  resetPasswordToken?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  emailVerified?: boolean;

  @property({
    type: 'array',
    itemType: 'string',
    default: [ROLES.USER],
    jsonSchema: {
      enum: Object.values(ROLES),
    },
  })
  roles?: ROLES[];

  @hasMany(() => Order, {keyTo: 'userId'})
  orders?: Order[];
}

export interface UserRelations {
  // describe navigational properties here
  // orders?: OrderWithRelations[];
}

export type UserWithRelations = User & UserRelations;
