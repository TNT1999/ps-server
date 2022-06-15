/* eslint-disable @typescript-eslint/no-explicit-any */
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
import axios from 'axios';
import {ObjectId} from 'mongodb';
// import d from '../../src/d.json';
import {Product, ProductWithRelations} from '../models';
import {ProductRepository} from '../repositories';
import {ProductService, ProductServiceBindings} from '../services';
const fs = require('fs');

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
      fields: {
        attrs: false,
        lname: false,
        variantsId: false,
        productFields: false,
        createdAt: false,
        colorOptions: false,
        hasVariants: false,
        isHot: false,
        isMainProduct: false,
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

  @post('product')
  @response(200, {
    description: 'Post product',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Product,
        },
      },
    },
  })
  async postProduct(@requestBody() product: Product): Promise<Product> {
    product.productFields.brand = new ObjectId(product.productFields.brand);
    const savedProduct = await this.productRepository.create(product);
    return savedProduct;
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
    const product = await this.productRepository.execute('Product', 'find', {
      $and: queryMongo,
    });
    const result = await product.toArray();
    return result;
  }

  @get('abc')
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
  async abc() {
    const getWard = async (id: string): Promise<any[]> => {
      const wards = await axios.get(
        `https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?${id}`,
        {
          headers: {
            token: 'f047137e-df82-11ec-b912-56b1b0c59a25',
          },
        },
      );
      return wards.data.data;
    };

    // W.forEach((wardFile:any) => {
    //   wardFile.wards((ward:any) => {

    //   })
    // })

    // const result: any = [];
    // for (let i = 0; i < D.length; i++) {
    //   const districtsItem = D[i] as any;
    //   for (let f = 0; f < districtsItem.districts.length; f++) {
    //     const districts = districtsItem.districts[f];
    //     console.log(i, districts.name);
    //     const item = final.find(
    //       (i: any) =>
    //         i.DistrictName.toLowerCase() === districts.name.toLowerCase(),
    //     );
    //     if (!item) {
    //       result.push({
    //         type: 'err',
    //         name: districts.name,
    //       });
    //       continue;
    //     }
    //     districtsItem.province_id = item.ProvinceID;
    //     districts.province_id = item.ProvinceID;
    //     districts.district_id = item.DistrictID;
    //     districts.name = item.DistrictName;
    //   }
    // delete item.code;
    // delete province.codename;
    // delete province.division_type;
    // // delete item.name;
    // delete province.phone_code;
    // province.districts.forEach((district: any) => {
    //   // delete district.code;
    //   delete district.codename;
    //   delete district.division_type;
    //   // delete district.name;
    //   delete district.short_codename;
    //   district.wards.forEach((ward: any) => {
    //     delete ward.codename;
    //     delete ward.division_type;
    //     delete ward.short_codename;
    //     ward.ward_id = ward.code;
    //     ward.district_id = district.code;
    //     ward.province_id = province.code;
    //     delete ward.code;
    //   });
    //   district.province_id = province.code;
    //   district.district_id = district.code;
    //   delete district.code;
    // });
    // delete province.code;
    // delete province.name;
    // // if (i === 1) break;
    // result.push(...province.districts);
    // console.log('p', province.districts);
    // result.push(districtsItem);
    // }
    // console.log('result', result);
    // const jsonString = JSON.stringify(result);
    // fs.writeFile('./src/d.json', jsonString, (err: any) => {
    //   if (err) {
    //     console.log('Error writing file', err);
    //   } else {
    //     console.log('Successfully wrote file');
    //   }
    // });
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
  //     // {skip: 40, limit: 20},
  //   );
  //   console.log(products);
  //   // eslint-disable-next-line @typescript-eslint/prefer-for-of
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

  //   if (!product) {
  //     return 'a';
  //   }

  //   product.colorOptions.forEach(color => {
  //     color.id = nanoid(8);
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
  //   return 'a';
}
