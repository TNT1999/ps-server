import {repository} from '@loopback/repository';
import {get, post, requestBody, response} from '@loopback/rest';
import {Variant} from '../models';
import {ProductRepository, VariantRepository} from '../repositories';
export class VariantController {
  constructor(
    @repository(VariantRepository) public variantRepository: VariantRepository,
    @repository(ProductRepository) public productRepository: ProductRepository,
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

  //   @get('variants/changeField/{id}')
  //   @response(200, {
  //     description: 'change field variants',
  //     content: {
  //       'application/json': {
  //         schema: {
  //           type: 'string',
  //         },
  //       },
  //     },
  //   })
  //   async addfield(@param.path.string('id') id: string) {
  //     const variants = await this.variantRepository.find({});
  //     for (let i = 0; i < variants.length; i++) {
  //       variants[i].variants?.forEach(variant => {
  //         // const product = await productRepository.findOne({
  //         //   where: {
  //         //     slug: variant.slug,
  //         //   },
  //         // });
  //         variant.price = parseInt(variant.price.toString());
  //         variant.id = nanoid();
  //       });
  //       await this.variantRepository.save(variants[i]);
  //     }
  //     return 'Success';
  //   }
  // }
}
