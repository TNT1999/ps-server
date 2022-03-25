import {repository} from '@loopback/repository';
import {get, param, response, SchemaObject} from '@loopback/rest';
import {Product} from '../models';
import {ProductRepository} from '../repositories';
const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 6,
      maxLength: 512,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};
type ChangePassword = {
  oldPassword: string;
  newPassword: string;
};
const ChangePasswordSchema: SchemaObject = {
  type: 'object',
  required: ['oldPassword', 'newPassword'],
  properties: {
    password: {
      type: 'string',
      minLength: 6,
      maxLength: 512,
    },
    newPassword: {
      type: 'string',
      minLength: 6,
      maxLength: 512,
    },
  },
};

export const ChangePasswordRequestBody = {
  description: 'The input of changePassword',
  required: true,
  content: {
    'application/json': {schema: ChangePasswordSchema},
  },
};

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
    const products = await this.productRepository.find({});
    // products[1].attrs?.push({
    //   name: 'a',
    //   value: 'a',
    // });
    // await this.productRepository.save(products[1]);
    // for (const product of products) {
    //   console.log(product);
    //   product.productFileds = undefined;
    //   await this.productRepository.save(product);
    // }
    return products;
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
  ): Promise<Product | null> {
    const product = await this.productRepository.findOne({
      where: {slug},
    });
    // if (product?.variantsId) {
    //   const variant = await this.productRepository.variant(product.id);
    //   console.log(variant);
    // }
    return product;
  }
}
