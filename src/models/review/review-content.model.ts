import {Model, model, property} from '@loopback/repository';

@model()
export class ReviewContent extends Model {
  constructor(data?: Partial<ReviewContent>) {
    super(data);
  }
  @property()
  content: string;

  @property()
  images: string[];
}
export interface ReviewContentRelations {
  // describe navigational properties here
}

export type ReviewContentWithRelations = ReviewContent & ReviewContentRelations;
