import {Model, model, property} from '@loopback/repository';

@model()
export class RefreshToken extends Model {
  constructor(data?: Partial<RefreshToken>) {
    super(data);
  }
  @property()
  userId: string;

  @property()
  refreshToken: string;
}

export interface RefreshTokenRelations {
  // describe navigational properties here
}

export type RefreshTokenTypeWithRelations = RefreshToken &
  RefreshTokenRelations;
