import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  get,
  param,
  post,
  Request,
  requestBody,
  response,
  RestBindings,
} from '@loopback/rest';
import {Product, ProductWithRelations} from '../models';
import {ProductRepository} from '../repositories';
import {ProductService, ProductServiceBindings} from '../services';

export class ProductController {
  constructor(
    @repository(ProductRepository) public productRepository: ProductRepository,
    @inject(RestBindings.Http.REQUEST) public request: Request,
    @inject(ProductServiceBindings.PRODUCT_SERVICE)
    public productService: ProductService,
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

  @get('product')
  @response(200, {
    description: 'Search product',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Product,
        },
      },
    },
  })
  async searchProduct(
    @param.query.string('q') keyword: string,
    @param.query.number('l') limit: number,
  ): Promise<ProductWithRelations | null> {
    console.log(keyword, limit);
    const product = await this.productRepository.execute(
      'Product',
      'aggregate',
      [
        {
          $match: {
            $text: {
              $search: keyword,
            },
          },
        },
        // {
        //   $project: {
        //     _id: 0,
        //     score: {
        //       $meta: 'textScore',
        //     },
        //   },
        // },
        {
          $sort: {score: {$meta: 'textScore'}},
        },
        {
          $limit: limit,
        },
      ],
      // {
      //   $text: {
      //     $search: keyword,
      //     $caseSensitive: false,
      //   },
      // },
      // {
      //   score: {$meta: 'textScore'},
      // },
      // {
      //   $sort: {score: {$meta: 'textScore'}},
      // },

      // {
      //   $limit: limit,
      // },
    );
    const result = await product.toArray();
    return result;
  }

  @get('filterProduct')
  @response(200, {
    description: 'Filter product',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Product,
        },
      },
    },
  })
  async filterProduct(): Promise<ProductWithRelations[] | null> {
    const query = this.productService.query2FilterArray(this.request.query);
    // if (!query) {
    //   const products = await this.productRepository.find({
    //     where: {
    //       isMainProduct: true,
    //     },
    //   });
    //   return products;
    // }
    const queryMongo = this.productService.filter2mongoQuery(query);
    // console.dir(JSON.stringify(queryMongo));
    const product = await this.productRepository.execute('Product', 'find', {
      $and: queryMongo,
    });
    const result = await product.toArray();
    // console.log(result);
    return result;
  }

  // @get('changeField/{slug}')
  // @response(200, {
  //   description: 'Filter product',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         'x-ts-type': Product,
  //       },
  //     },
  //   },
  // })
  // async addAllField(@param.path.string('slug') slug: string) {
  //   const products = await this.productRepository.find(
  //     {
  //       // where: {slug},
  //     },
  //     {skip: 30, limit: 20},
  //   );
  //   console.log(products);
  //   for (let i = 0; i < products.length; i++) {
  //     this.addField(products[i].slug);
  //   }
  //   // products.forEach(product => this.addField(product.slug));
  // }

  // async addField(slug: string | undefined) {
  //   if (!slug) return 'a';
  //   const product = await this.productRepository.findOne({
  //     where: {slug},
  //   });
  //   if (!product?.price) {
  //     return;
  //   }

  //   // const execute = await this.productRepository.execute(
  //   //   'Product',
  //   //   'updateMany',
  //   //   {
  //   //     slug,
  //   //   },

  //   //   [
  //   //     {
  //   //       $set: {
  //   //         price: {$toDouble: '$price'},
  //   //         // 'colorOptions.amount': '1000',
  //   //         // 'colorOptions.price': '1000000',
  //   //         'colorOptions.amount': {
  //   //           $convert: {
  //   //             input: '$colorOptions.amount',
  //   //             to: 'double',
  //   //             onError: '$colorOptions.amount',
  //   //             onNull: 0,
  //   //           },
  //   //         },
  //   //         'colorOptions.price': {
  //   //           $convert: {
  //   //             input: '$colorOptions.price',
  //   //             to: 'double',
  //   //             onError: '1000',
  //   //             onNull: 0,
  //   //           },
  //   //         },
  //   //       },
  //   //     },
  //   //   ],
  //   // );

  //   // console.log(execute);

  //   // if (
  //   //   !product?.price ||
  //   //   !product.productFields ||
  //   //   !product.productFields.brand ||
  //   //   !product?.lname
  //   // ) {
  //   //   return 'a';
  //   // }

  //   product.price = parseInt(product.price.toString());

  //   product.colorOptions.forEach(color => {
  //     // eslint-disable-next-line no-unused-expressions
  //     (color.amount = 1000), (color.price = parseInt(color.price.toString()));
  //   });

  //   await this.productRepository.save(product);

  //   // const result = await this.productRepository.execute(
  //   //   'Product',
  //   //   'findOneAndUpdate',
  //   //   {slug},
  //   //   {
  //   //     $set: {
  //   //       // lname: product.lname?.toLowerCase(),
  //   //       price: parseInt(product.price.toString()),
  //   //       // colorOptions:
  //   //       // 'productFields.price': parseInt(product?.price),
  //   //       // 'productFields.storage_tb': parseInt(
  //   //       //   product?.productFields.storage_tb,
  //   //       // ),
  //   //       // 'productFields.brand': new ObjectId(product?.productFields.brand),
  //   //     },
  //   //   },
  //   // );
  //   // return 'a';
  // }
}
