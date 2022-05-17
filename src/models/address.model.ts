import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

export enum AddressType {
  HOME = 'home',
  COMPANY = 'company',
}

@model({
  settings: {
    mongodb: {collection: 'Address'},
  },
})
export class Address extends Entity {
  constructor(data?: Partial<Address>) {
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

  @property({
    type: 'string',
    jsonSchema: {
      pattern: '\\d+',
    },
  })
  phone: string;

  @property({
    type: 'string',
  })
  name: string;

  @property()
  districtId: number;

  @property()
  district: string;

  @property()
  cityId: number;

  @property()
  city: string;

  @property()
  wardId: number;

  @property()
  ward: string;

  @property({
    type: 'string',
  })
  address: string;

  @property({
    type: 'boolean',
  })
  isDefault: boolean;

  @property({
    type: 'string',
    jsonSchema: {
      enum: Object.values(AddressType),
    },
  })
  addressType?: string;

  @property({
    type: 'date',
    defaultFn: 'now',
  })
  createdAt?: 'date';
}

export interface AddressRelations {
  // describe navigational properties here
  // orders?: OrderWithRelations[];
}

export type AddressWithRelations = Address & AddressRelations;
