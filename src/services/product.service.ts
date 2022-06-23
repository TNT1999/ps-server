/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey} from '@loopback/core';
import {repository} from '@loopback/repository';
import {ObjectId} from 'mongodb';
import {UserRepository} from '../repositories';

export type Filter = {
  brand: string[];
  ram: string[];
  price: string[];
  storage: string[];
  display: string[];
};

export const BrandMapping = {
  apple: new ObjectId('6265162eed0321a0b9ccbf21'),
  vsmart: new ObjectId('626516fbed0321a0b9ccbf2d'),
  oppo: new ObjectId('6265169eed0321a0b9ccbf28'),
  xiaomi: new ObjectId('6265168ced0321a0b9ccbf26'),
  nokia: new ObjectId('626516b0ed0321a0b9ccbf29'),
  samsung: new ObjectId('62651679ed0321a0b9ccbf25'),
  vivo: new ObjectId('62651728ed0321a0b9ccbf2f'),
  realme: new ObjectId('626516dbed0321a0b9ccbf2b'),
};

export class ProductService {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
  ) {}

  expandPrice(value: string) {
    switch (value) {
      case 'lt5tr':
        return {'productFields.price': {$lt: 5000000}};
      case 'gte5lt10tr':
        return {'productFields.price': {$gte: 5000000, $lt: 10000000}};
      case 'gte10lt15tr':
        return {'productFields.price': {$gte: 10000000, $lt: 15000000}};
      case 'gte15lt20tr':
        return {'productFields.price': {$gte: 15000000, $lt: 20000000}};
      case 'gt20tr':
        return {'productFields.price': {$gt: 20000000}};
    }
  }
  expandDisplay(value: string) {
    switch (value) {
      case 'lt5':
        return {'productFields.display_size_inches': {$lt: 5}};
      case 'gte5lt5.5':
        return {'productFields.display_size_inches': {$gte: 5, $lt: 5.5}};
      case 'gte5.5lt6':
        return {'productFields.display_size_inches': {$gte: 5.5, $lt: 6}};
      case 'gt6':
        return {'productFields.display_size_inches': {$gt: 6}};
    }
  }
  getBrandIdByName(name: keyof typeof BrandMapping) {
    return BrandMapping[name] || null;
  }
  query2FilterArray = (filter: any) => {
    for (const key of Object.keys(filter)) {
      if (!Array.isArray(filter[key])) {
        filter[key] = (filter[key] as any).split(',');
      }
    }
    return filter;
  };

  filter2mongoQuery(filter: any): any {
    const findBy = [];
    if (filter.brand) {
      findBy.push({
        'productFields.brand': {
          $in: filter.brand.map((b: keyof typeof BrandMapping) =>
            this.getBrandIdByName(b),
          ),
        },
      });
    }
    if (filter.ram) {
      if (filter.ram.includes('gt8')) {
        //có trên 8gb
        if (filter.ram.length === 1) {
          // chỉ có trên 8gb
          findBy.push({'productFields.ram_gb': {$gt: 8}});
        } else {
          // trên 8gb và option
          findBy.push({
            $or: [
              {'productFields.ram_gb': {$gt: 8}},
              {'productFields.ram_gb': {$in: filter.ram.map(Number)}},
            ],
          });
        }
      } else {
        findBy.push({'productFields.ram_gb': {$in: filter.ram.map(Number)}});
      }
    }
    if (filter.storage) {
      if (filter.storage.includes('gt256')) {
        //có trên 256gb
        if (filter.storage.length === 1) {
          // chỉ có trên 256gb
          findBy.push({
            $or: [
              {'productFields.storage_gb': {$gt: 256}},
              {'productFields.storage_tb': {$gte: 1}},
            ],
          });
        } else {
          // trên 256gb và option
          findBy.push({
            $or: [
              {'productFields.storage_gb': {$gt: 256}},
              {'productFields.storage_gb': {$in: filter.storage.map(Number)}},
              {'productFields.storage_tb': {$gte: 1}},
            ],
          });
        }
      } else {
        findBy.push({
          'productFields.storage_gb': {$in: filter.storage.map(Number)},
        });
      }
    }
    if (filter.price) {
      const value = filter.price.map((code: string) => this.expandPrice(code));
      findBy.push({$or: value});
    }
    if (filter.display) {
      const value = filter.display.map((code: string) =>
        this.expandDisplay(code),
      );
      findBy.push({$or: value});
    }
    return findBy;
  }
}

export namespace ProductServiceBindings {
  export const PRODUCT_SERVICE = BindingKey.create<ProductService>(
    `services.${ProductService.name}_custom.service`,
  );
}
