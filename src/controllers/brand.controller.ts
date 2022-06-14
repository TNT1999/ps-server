import {authenticate} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {get, response} from '@loopback/rest';
import {Brand} from '../models';
import {BrandRepository} from '../repositories';

export class BrandController {
  constructor(
    @repository(BrandRepository) public brandRepository: BrandRepository,
  ) {}

  @authenticate('jwt')
  @get('/brands')
  @response(200, {
    description: 'Get brands',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: Brand,
        },
      },
    },
  })
  async getBrands() {
    const brands = await this.brandRepository.find({});
    return brands;
  }
}
