import {Model, model, property} from '@loopback/repository';

@model()
export class RecentProductItem extends Model {
  constructor(data?: Partial<RecentProductItem>) {
    super(data);
  }

  @property()
  productId: string;

  @property()
  count: number;
}

export interface RecentProductItemRelations {
  // describe navigational properties here
}

export type RecentProductItemWithRelations = RecentProductItem &
  RecentProductItemRelations;
