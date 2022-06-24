/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {authenticate} from '@loopback/authentication';
import {
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {FilterBuilder, repository} from '@loopback/repository';
import {
  del,
  get,
  param,
  post,
  put,
  Request,
  requestBody,
  response,
  RestBindings,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {isNil, omitBy} from 'lodash';
import {ObjectId} from 'mongodb';
// import d from '../../src/d.json';
import {
  Product,
  ProductWithRelations,
  RecentProduct,
  RecentProductItem,
} from '../models';
import {
  ProductRepository,
  ReviewRepository,
  UserRepository,
} from '../repositories';
import {RecentProductRepository} from '../repositories/recent-product.repository';
import {JWTService, ProductService, ProductServiceBindings} from '../services';

const fs = require('fs');

export class ProductController {
  constructor(
    @repository(ProductRepository) public productRepository: ProductRepository,
    @repository(ReviewRepository) public reviewRepository: ReviewRepository,
    @repository(RecentProductRepository)
    public recentProductRepository: RecentProductRepository,
    @inject(RestBindings.Http.REQUEST) public request: Request,
    @inject(ProductServiceBindings.PRODUCT_SERVICE)
    public productService: ProductService,
    @inject(UserServiceBindings.USER_REPOSITORY)
    public userRepository: UserRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
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
        // isHot: true,
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

  @get('allProduct')
  @response(200, {
    description: 'Product all for training',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Product,
        },
      },
    },
  })
  async getAllProducts(): Promise<Product[]> {
    const p = await this.productRepository.execute('Product', 'aggregate', [
      {
        $addFields: {
          // productId: '$_id',
          // ram_gb: '$productFields.ram_gb',
          // brand: '$productFields.brand',
          // price: '$productFields.price',
          // display_size_inches: '$productFields.display_size_inches',
          // storage_gb: '$productFields.storage_gb',
          // storage_tb: '$productFields.storage_tb',
        },
      },
      {
        $project: {
          reviewCount: false,
          _id: false,
          thumbnail: false,
          createdAt: false,
          slug: false,
          colorOptions: false,
          hasVariants: false,
          isHot: false,
          isMainProduct: false,
          lname: false,
          variantsId: false,
          'attrs.id': false,
          'attrs.name': false,
          ratingValue: false,
          price: false,
          discount: false,
          productFields: false,
        },
      },
    ]);

    const products = await p.toArray();
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
  async getProduct(@param.path.string('slug') slug: string): Promise<any> {
    const filterBuilder = new FilterBuilder<Product>();

    filterBuilder
      .where({slug})
      .include('variants')
      .include({
        relation: 'comments',
        scope: {
          where: {
            level: 0,
          },
          skip: 0,
          limit: 20,
          order: ['createdAt DESC'],
          include: [
            {
              relation: 'replies',
              scope: {
                order: ['createdAt ASC'],
              },
            },
          ],
        },
      })
      .include({
        relation: 'reviews',
        scope: {
          skip: 0,
          limit: 5,
          order: ['createdAt DESC'],
        },
      })
      .build();

    const product: any = await this.productRepository.findOne(
      filterBuilder.filter,
    );

    const reviews = await this.reviewRepository.execute('Review', 'aggregate', [
      {
        $match: {
          productId: new ObjectId(product?.id),
        },
      },
      {
        $group: {
          _id: '$reviewValue',
          // count: {$sum: 1},
          count: {
            $count: {},
          },
        },
      },
      // {
      //   $group: {
      //     _id: 'null',
      //     ratingByStar: {
      //       $push: {
      //         star: '$_id',
      //         count: '$count',
      //       },
      //     },
      //     // totalReview: {$sum: '$count'},
      //   },
      // },
      {$project: {star: '$_id', _id: 0, count: 1}},
    ]);

    const ratingByStar = await reviews.toArray();

    const newProduct = Object.assign({}, {ratingByStar}, product);
    return newProduct;
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
    // const getWard = async (id: string): Promise<any[]> => {
    //   const wards = await axios.get(
    //     `https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?${id}`,
    //     {
    //       headers: {
    //         token: 'f047137e-df82-11ec-b912-56b1b0c59a25',
    //       },
    //     },
    //   );
    //   return wards.data.data;

    const email = [
      'vuonggia_ngo80@hotmail.com',
      'thuydung.vuong@gmail.com',
      'monghoa_mai32@yahoo.com',
      'ngocquynh76@gmail.com',
      'diemloc_lam@yahoo.com',
      'thientheu_lam2@hotmail.com',
      'hoangkim27@yahoo.com',
      'vinhquoc.mai@hotmail.com',
      'khanhtrang_bui90@hotmail.com',
      'hieukhanh.ha36@hotmail.com',
      'hongson_vu@hotmail.com',
      'dangminh55@hotmail.com',
      'hungcuong46@yahoo.com',
      'tuanminh_pham@gmail.com',
      'kiengiang.tang@yahoo.com',
      'huuhiep.nguyen58@yahoo.com',
      'mytrang.ly5@hotmail.com',
      'trangnha.duong@hotmail.com',
      'myhiep_duong@hotmail.com',
      'vantien_duong@yahoo.com',
      // 'thuymy.dao0@gmail.com',
      // 'minhphuong.phan@gmail.com',
      // 'thaiduy_tang65@hotmail.com',
      // 'khuclan.truong@gmail.com',
      // 'hoangyen.duong@yahoo.com',
      // 'bichha.le@yahoo.com',
      // 'quangha65@gmail.com',
      // 'baoquoc.lam@yahoo.com',
      // 'hamtho.mai@yahoo.com',
      // 'minhhung.ly53@hotmail.com',
      // 'bachdu.tran84@gmail.com',
      // 'huongtien5@yahoo.com',
      // 'hanhmy_do@yahoo.com',
      // 'tonle_vuong7@hotmail.com',
      // 'chuankhoa41@yahoo.com',
      // 'hongthuy.doan@gmail.com',
      // 'minhdanh.tang18@yahoo.com',
      // 'locuyen_trinh@yahoo.com',
      // 'maichi.ha75@hotmail.com',
      // 'vietduong.phung53@yahoo.com',
      // 'toanthang.trinh82@yahoo.com',
      // 'thucdoan_truong93@yahoo.com',
      // 'hami.tang@hotmail.com',
      // 'thulinh_dinh49@yahoo.com',
      // 'lapthanh47@hotmail.com',
      // 'daingoc_tran@yahoo.com',
      // 'truongnam_ngo@hotmail.com',
      // 'minhhang10@gmail.com',
      // 'lamdung73@hotmail.com',
      // 'baoquyen_ho66@gmail.com',
      // 'ductri.vu26@gmail.com',
      // 'thanhnga7@hotmail.com',
      // 'ngoccuong.ho39@yahoo.com',
      // 'khuyenhoc71@hotmail.com',
      // 'vuminh31@yahoo.com',
      // 'conghau.dao@hotmail.com',
      // 'minhvu.hoang65@hotmail.com',
      // 'truongthanh.doan15@gmail.com',
      // 'buutoai.to@gmail.com',
      // 'lamtuong0@yahoo.com',
      // 'khactrong84@yahoo.com',
      // 'tuongphat.tang@hotmail.com',
      // 'duyngon.duong70@yahoo.com',
      // 'vietvo_tang@hotmail.com',
      // 'mytram.truong64@gmail.com',
      // 'anhkhoa12@hotmail.com',
      // 'quyetthang.phan60@yahoo.com',
      // 'huuminh42@yahoo.com',
      // 'haison99@gmail.com',
      // 'myphuong.ho@yahoo.com',
      // 'vietthong_mai81@hotmail.com',
      // 'lanngoc29@hotmail.com',
      // 'thanhyen74@gmail.com',
      // 'anhquoc.ngo@gmail.com',
      // 'monglan88@yahoo.com',
      // 'ducquyen.do75@hotmail.com',
      // 'hoaiphuong.pham51@hotmail.com',
      // 'tuankiet20@yahoo.com',
      // 'kimngan.tang43@yahoo.com',
      // 'quynhgiao.do@gmail.com',
      // 'theson34@gmail.com',
      // 'haiduong10@gmail.com',
      // 'congthanh.ly71@gmail.com',
      // 'hoangviet_duong@hotmail.com',
      // 'kienbinh.trinh@gmail.com',
      // 'thaonguyen_to@gmail.com',
      // 'minhthang_do85@gmail.com',
      // 'huutam_vu@yahoo.com',
      // 'phuocson.doan46@gmail.com',
      // 'kimthu_vu39@hotmail.com',
      // 'dinhloc7@yahoo.com',
      // 'ngochoan.ngo26@gmail.com',
      // 'phuongquyen12@hotmail.com',
      // 'honglam94@yahoo.com',
      // 'bachvan1@gmail.com',
      // 'hoami.duong0@hotmail.com',
      // 'trangnha.phung@hotmail.com',
      // 'huunam8@yahoo.com',
      // 'quocbao36@gmail.com',
      // 'kimxuan_do@gmail.com',
    ];

    const name = [
      'Phạm Trung Hải',
      'Phạm Ngọc Khôi',
      'Phạm Xuân Thiện',
      'Phạm Nhật Minh',
      'Phạm Gia Cảnh',
      'Phạm Việt An',
      'Phạm Đức Cao',
      'Phạm Quang Đạt',
      'Phạm Tường Lĩnh',
      'Phạm Ðức Hòa',
      'Phạm Dũng Việt',
      'Phạm Trí Hào',
      'Phạm Gia Anh',
      'Phạm Trường Phúc',
      'Phạm Phước An',
      'Phạm Khải Tâm',
      'Phạm Quang Linh',
      'Phạm Công Tuấn',
      'Phạm Thiệu Tước',
      'Phạm Duy Trác',
      'Đặng Phương Thảo',
      'Đặng Huyền Trang',
      'Đặng Đông Nghi',
      'Đặng Thanh Hà',
      'Đặng Tuyết Loan',
      'Đặng Bích Hằng',
      'Đặng Quỳnh Chi',
      'Đặng Kiều Vân Giang',
      'Đặng Bích Thủy',
      'Đặng Phương Liên',
      'Đặng Việt Khuê',
      'Đặng Kim Đan',
      'Đặng Bảo Dương',
      'Đặng Cam Thảo',
      'Đặng Thi Thi',
      'Đặng Trang Anh',
      'Đặng Tú Ly',
      'Đặng Thảo Quyên',
      'Đặng Vy Bảo Thoa',
      'Đặng Thanh Phương',
      'Nguyễn Bích Hậu',
      'Nguyễn Anh Ðào',
      'Nguyễn Thúy Huyền',
      'Nguyễn Vân Tiên',
      'Nguyễn Ngọc Uyên',
      'Nguyễn Bích Thảo',
      'Nguyễn Như Quỳnh',
      'Nguyễn Uyên Thư',
      'Nguyễn Thiên Khánh',
      'Nguyễn Uyên',
      'Nguyễn Kiều Hương Giang',
      'Nguyễn Tố Quyên',
      'Nguyễn Kiều Dung',
      'Nguyễn Hạnh',
      'Nguyễn Ngọc Hạ',
      'Nguyễn Thúy Ngân',
      'Nguyễn Xuân Thảo',
      'Nguyễn Thúy Mai',
      'Nguyễn Thụy Khanh',
      'Nguyễn Ngọc Vy',
      'Trần Khánh Nam',
      'Trần Tấn Lợi',
      'Trần Liên Kiệt',
      'Trần Xuân Nam',
      'Trần Minh Ðan',
      'Trần Bảo Nam',
      'Trần Xuân Huy',
      'Trần Hùng Cường',
      'Trần Thanh Hậu',
      'Trần Ngọc Quang',
      'Trần Quang Tú',
      'Trần An Khang',
      'Trần Phi Cường',
      'Trần Mạnh Nghiêm',
      'Trần Gia Huấn',
      'Trần Chí Bảo',
      'Trần Phúc Nguyên',
      'Trần Khôi Vĩ',
      'Trần Khánh Huy',
      'Trần Nhật Quang',
      'Lê Hoàng Hiệp',
      'Lê Tấn Tài',
      'Lê Thành Nhân',
      'Lê Ðức Ân',
      'Lê Nam Hưng',
      'Lê Hữu Toàn',
      'Lê Huy Thông',
      'Lê Hùng Phương',
      'Lê Thành Tín',
      'Lê Bảo Toàn',
      'Lê Nam Dương',
      'Lê Quang Đông',
      'Lê Ðinh Lộc',
      'Lê Minh Ðức',
      'Lê Anh Thái',
      'Lê Việt Long',
      'Lê Minh Thiện',
      'Lê Đức Hoà',
      'Lê Trọng Khánh',
      'Lê Xuân Ninh',
    ];

    // const a = await this.userRepository.createAll(
    //   email.map((item, index) => ({
    //     email: item,
    //     name: name[index],
    //     password: '123456',
    //     emailVerified: true,
    //     isActive: true,
    //   })),
    // );

    // return a.map(a => a.id);
    const uids = [
      '62acb8c1c2cfdd23dce875aa',
      '62acb8c1c2cfdd23dce875ab',
      '62acb8c1c2cfdd23dce875ac',
      '62acb8c1c2cfdd23dce875ad',
      '62acb8c1c2cfdd23dce875ae',
      '62acb8c1c2cfdd23dce875af',
      '62acb8c1c2cfdd23dce875b0',
      '62acb8c1c2cfdd23dce875b1',
      '62acb8c1c2cfdd23dce875b2',
      '62acb8c1c2cfdd23dce875b3',
      '62acb8c1c2cfdd23dce875b4',
      '62acb8c1c2cfdd23dce875b5',
      '62acb8c1c2cfdd23dce875b6',
      '62acb8c1c2cfdd23dce875b7',
      '62acb8c1c2cfdd23dce875b8',
      '62acb8c1c2cfdd23dce875b9',
      '62acb8c1c2cfdd23dce875ba',
      '62acb8c1c2cfdd23dce875bb',
      '62acb8c1c2cfdd23dce875bc',
      '62acb8c1c2cfdd23dce875bd',
    ];
    const listPro = await this.productRepository.find({});

    const listIdProduct = listPro.map(p => p.id);

    // email.forEach(async i => {
    //   return this.userRepository.deleteAll({
    //     email: i,
    //   });
    // });

    // const list = a.map(r => r.id);
    // console.log(list);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    uids.forEach(async uid => {
      let a = await this.recentProductRepository.findOne({
        where: {
          userId: uid,
        },
      });
      if (!a) {
        a = await this.recentProductRepository.create({
          userId: uid,
          recentProduct: [],
        });
      }

      const getRandonNumberFrom0To = (end: number) => {
        return Math.random() * end;
      };
      const length = Math.round(
        listIdProduct.length - 35 - getRandonNumberFrom0To(3),
      );
      console.log(length);
      const numberProductRecentApplyToUser = new Array(length).fill(0);

      const ListRandomProductId = numberProductRecentApplyToUser.map(() => {
        const index = Math.floor(getRandonNumberFrom0To(listIdProduct.length));
        return listIdProduct[index];
      });
      const removedDuplicate = [...new Set(ListRandomProductId)];
      const abc = removedDuplicate.map((i: string) => {
        return {
          productId: i,
          count: Math.ceil(getRandonNumberFrom0To(4)),
        };
      });
      console.log('-----------------------------', abc.length, '\n');
      a.recentProduct = abc as unknown as RecentProductItem[];
      await this.recentProductRepository.save(a);
    });

    // const recentPro = await this.recentProductRepository.findById();

    // return list;
  }

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

  @authenticate('jwt')
  @get('{pid}/viewed')
  @response(200, {
    description: 'Track product recent of User',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': RecentProduct,
        },
      },
    },
  })
  async trackRecent(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.path.string('pid') pid: string,
  ) {
    const userId = currentUserProfile[securityId];

    let productRecent = await this.recentProductRepository.findOne({
      where: {
        userId,
      },
    });

    if (!productRecent) {
      const productRecentCreate = await this.recentProductRepository.create({
        userId,
        recentProduct: [],
      });
      // return;
      productRecent = productRecentCreate;
    }
    if (!productRecent.recentProduct) {
      productRecent.recentProduct = [];
    }

    const index = productRecent.recentProduct.findIndex(
      productItem => productItem.productId === pid,
    );
    if (index === -1) {
      productRecent.recentProduct.unshift({
        productId: pid,
        count: 1,
      } as RecentProductItem);
    } else {
      productRecent.recentProduct[index].count += 1;
    }
    productRecent.recentProduct = productRecent.recentProduct.slice(0, 20);
    await this.recentProductRepository.update(productRecent);
    // const a = await this.recentProductRepository.create({
    //   userId,
    //   recentProduct: [body],
    // });
    // return a;
    //   try {
    //     await this.recentProductRepository.execute('RecentProduct', 'aggregate', [
    //       {
    //         userId,
    //       },
    //       {
    //         $set: {
    //           recentProduct: {
    //             $cond: [
    //               {$in: [productId, '$recentProduct.productId']},
    //               {
    //                 $map: {
    //                   input: '$recentProduct',
    //                   in: {
    //                     $cond: [
    //                       {
    //                         $eq: ['$$this.productId', productId],
    //                       },
    //                       {
    //                         productId: '$$this.productId',
    //                         timeSpend: timeSpend,
    //                       },
    //                       '$$this',
    //                     ],
    //                   },
    //                 },
    //               },
    //               {
    //                 $concatArrays: ['$stock', [body]],
    //               },
    //             ],
    //           },
    //         },
    //       },
    //     ]);
    //   } catch (e) {
    //     console.log(e);
    //   }
  }

  @get('allView')
  @response(200, {
    description: 'Get All View product recent of User',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Product,
        },
      },
    },
  })
  async AllViewRecent() {
    const allRecent = await this.recentProductRepository.find({});
    const result: any[] = [];

    allRecent.forEach(recentByUser => {
      recentByUser.recentProduct?.forEach(pro =>
        result.push({
          userId: recentByUser.userId,
          productId: pro.productId,
          count: pro.count,
        }),
      );
    });

    return result;
  }

  @get('{pid}/calc/review')
  @response(200, {
    description: 'Get All View product recent of User',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Product,
        },
      },
    },
  })
  async calcCountAndAvgReview(@param.path.string('pid') pid: string) {
    const result = await this.reviewRepository.execute('Review', 'aggregate', [
      {
        $match: {productId: new ObjectId(pid)},
      },
      {
        $group: {
          _id: null,
          count: {$sum: 1},
          avg: {$avg: '$reviewValue'},
        },
      },
    ]);

    const [{count, avg}] = await result.toArray();

    await this.productRepository.updateById(pid, {
      ratingValue: avg,
      reviewCount: count,
    });
    return 'ok';
  }

  @put('product')
  @response(200, {
    description: 'Update product for Admin',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Product,
        },
      },
    },
  })
  async updateProduct(@requestBody() updateProduct: Product) {
    try {
      // const result = await this.productRepository.execute(
      //   'Product',
      //   'findOneAndUpdate',
      //   {
      //     id: new ObjectId(updateProduct.id),
      //   },
      //   {
      //     $set: {
      //       updateProduct,
      //     },
      //   },
      //   {
      //     returnDocument: 'after',
      //   },
      // );
      const result = await this.productRepository.updateById(
        updateProduct.id,
        updateProduct,
      );
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  @get('origin/product/{slug}')
  @response(200, {
    description: 'Get origin product for admin',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Product,
        },
      },
    },
  })
  async getOriginProduct(@param.path.string('slug') slug: string) {
    const result = await this.productRepository.findOne({
      where: {slug},
      fields: {
        updatedAt: false,
        ratingValue: false,
        reviewCount: false,
      },
    });
    return omitBy(result, isNil);
  }

  @get('origin/products')
  @response(200, {
    description: 'Get origin product for admin',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: Product,
        },
      },
    },
  })
  async getOriginProducts(@param.query.number('page') page: number) {
    if (page <= 0) {
      return [];
    }
    const filterBuilder = new FilterBuilder<Product>();
    const reviewPerPage = 10;
    const filter = filterBuilder
      .where({})
      .limit(reviewPerPage)
      .offset((page - 1) * reviewPerPage)
      .order('createdAt DESC')
      .fields({
        attrs: false,
        lname: false,
        // updatedAt: false
        // productFields: false,
      })
      .build();
    const result: any[] = await this.productRepository.find(filter);
    return result;
  }

  @del('product/{pid}')
  @response(200, {
    description: 'Delete product for admin',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: Product,
        },
      },
    },
  })
  async deleteProduct(@param.path.string('pid') pid: string) {
    const result = await this.productRepository.deleteById(pid);
    return result;
  }

  @get('xyz')
  @response(200, {
    description: 'Delete product for admin',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: Product,
        },
      },
    },
  })
  async a() {
    const result = await this.productRepository.find({});
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    result.forEach(async product => {
      const a = [
        'Hãng sản xuất',
        'Dung lượng RAM',
        'Bộ nhớ trong',
        'Kích thước màn hình',
      ];
      product.attrs?.map(attr => {
        if (a.includes(attr.name)) {
          attr.canDelete = false;
          attr.canEditName = false;
        }
        if (attr.name === 'Hãng sản xuất') {
          attr.productFields = 'brand';
          attr.type = 'select';
        }
        if (attr.name === 'Dung lượng RAM') {
          attr.productFields = 'ram_gb';
        }
        if (attr.name === 'Kích thước màn hình') {
          attr.productFields = 'display_size_inches';
        }
        if (attr.name === 'Bộ nhớ trong') {
          attr.productFields = 'storage_gb';
        }
        return attr;
      });

      await this.productRepository.update(product);
    });
    return result;
  }
}
