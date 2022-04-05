import {Model, model, property} from '@loopback/repository';

@model()
export class Reviewer extends Model {
  constructor(data?: Partial<Reviewer>) {
    super(data);
  }
  @property()
  id: string;

  @property()
  name: string;
}
export interface ReviewerRelations {
  // describe navigational properties here
}

export type ReviewerWithRelations = Reviewer & ReviewerRelations;
