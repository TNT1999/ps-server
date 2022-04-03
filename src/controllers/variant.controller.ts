import {repository} from '@loopback/repository';
import {get, post, requestBody, response} from '@loopback/rest';
import {Variant} from '../models';
import {VariantRepository} from '../repositories';
export class VariantController {
  constructor(
    @repository(VariantRepository) public variantRepository: VariantRepository,
  ) {}

  // @authenticate('jwt')
  // @authorize({allowedRoles: [ROLES.ADMIN]})
  @get('variants')
  @response(200, {
    description: 'Get all variants',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Variant,
        },
      },
    },
  })
  async getVariants(): Promise<Variant[]> {
    const variants = await this.variantRepository.find({});
    return variants;
  }

  // @authenticate('jwt')
  // @authorize({allowedRoles: [ROLES.ADMIN]})
  @get('variants/mock')
  @response(200, {
    description: 'Mock variants',
    content: {
      'application/json': {
        schema: {
          type: 'string',
        },
      },
    },
  })
  async mockVariants() {
    return 'Success';
  }

  // @authenticate('jwt')
  // @authorize({allowedRoles: [ROLES.ADMIN]})
  @post('variants')
  @response(200, {
    description: 'Save all variants',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Variant,
        },
      },
    },
  })
  async saveVariants(
    @requestBody() variants: Variant[],
  ): Promise<Variant[] | string> {
    const savedVariants = await this.variantRepository.createAll(variants);
    return savedVariants;
  }
}
