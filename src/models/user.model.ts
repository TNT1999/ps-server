import {Entity, model, property} from '@loopback/repository';

enum ROLE {
  USER = 'user',
  ADMIN = 'admin',
}

@model({
  settings: {
    mongodb: {collection: 'Users'},
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
    hidden: true,
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
  password: string;

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
    type: 'string',
    default: undefined,
  })
  verificationToken?: string;

  @property({
    type: 'string',
    default: ROLE.USER,
    jsonSchema: {
      enum: Object.values(ROLE),
    },
  })
  role?: ROLE;
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
