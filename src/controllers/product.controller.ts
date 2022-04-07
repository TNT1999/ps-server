import {authenticate} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {get, param, post, requestBody, response} from '@loopback/rest';
import {Product, ProductWithRelations} from '../models';
import {ProductRepository} from '../repositories';

export class ProductController {
  constructor(
    @repository(ProductRepository) public productRepository: ProductRepository,
  ) {}

  @get('products')
  @response(200, {
    description: 'Product for home page user',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Product,
        },
      },
    },
  })
  async getHomeProducts(): Promise<Product[]> {
    const products = await this.productRepository.find({
      where: {
        isMainProduct: true,
      },
    });
    return products;
  }

  // @authenticate('jwt')
  // @authorize({allowedRoles: [ROLES.ADMIN]})
  @get('products/mock')
  @response(200, {
    description: 'Mock products',
    content: {
      'application/json': {
        schema: {
          type: 'string',
        },
      },
    },
  })
  async mockProducts() {
    return 'Success';
  }

  @authenticate('jwt')
  // @authorize({allowedRoles: [ROLES.ADMIN]})
  @post('products')
  @response(200, {
    description: 'Save all products',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Product,
        },
      },
    },
  })
  async saveProducts(
    @requestBody() products: Product[],
  ): Promise<Product[] | string> {
    const savedProducts = await this.productRepository.createAll(products);
    return savedProducts;
  }

  @authenticate('jwt')
  // @authorize({allowedRoles: [ROLES.ADMIN]})
  @post('product')
  @response(200, {
    description: 'Create product',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Product,
        },
      },
    },
  })
  async savedProduct(@requestBody() product: Product): Promise<Product> {
    console.log(product);
    const savedProducts = await this.productRepository.create(product);
    return savedProducts;
  }

  @get('product/{slug}')
  @response(200, {
    description: 'Product for detail',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Product,
        },
      },
    },
  })
  async getProduct(
    @param.path.string('slug') slug: string,
  ): Promise<ProductWithRelations | null> {
    const product = await this.productRepository.findOne({
      where: {slug},
      include: [
        {
          relation: 'variants',
        },
        {
          relation: 'comments',
          scope: {
            where: {
              level: 0,
            },
            skip: 0,
            limit: 20,
            // fields: {
            //   rootCommentId: false,
            //   replyToCommentId: false,
            //   replyToUser: false,
            //   deletedAt: false,
            // },
            order: ['createdAt DESC'],
            // totalLimit: 1,
            include: [{relation: 'replies', scope: {order: ['createdAt ASC']}}],
          },
        },
        {
          relation: 'reviews',
          scope: {
            order: ['createdAt DESC'],
          },
        },
      ],
    });
    return product;
  }
}
