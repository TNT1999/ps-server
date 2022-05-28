/* eslint-disable @typescript-eslint/naming-convention */
import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
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
import omit from 'lodash/omit';
import {ObjectId} from 'mongodb';
import Districts from '../mocks/address/districts.json';
import Provinces from '../mocks/address/provinces.json';
import Wards from '../mocks/address/wards.json';
import {Address} from '../models';
import {AddressRepository} from '../repositories';
export class AddressController {
  constructor(
    @inject(RestBindings.Http.REQUEST) private req: Request,
    @repository(AddressRepository) public addressRepository: AddressRepository,
  ) {}

  @get('/address/province')
  @response(200, {
    description: 'Provinces Response',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            name: {type: 'string'},
            province_id: {type: 'string'},
          },
        },
      },
    },
  })
  async getProvince() {
    return Provinces;
  }

  @get('/address/district')
  @response(200, {
    description: 'Districts Response',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            name: {type: 'string'},
            province_id: {type: 'string'},
            districts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {type: 'string'},
                  province_id: {type: 'string'},
                  district_id: {type: 'string'},
                },
              },
            },
          },
        },
      },
    },
  })
  async getDistricts(@param.query.number('province_id') provinceId: number) {
    const result = Districts.find(
      district => district.province_id === provinceId,
    );
    return result;
  }

  @get('/address/ward')
  @response(200, {
    description: 'Wards Response',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            name: {type: 'string'},
            province_id: {type: 'string'},
            district_id: {type: 'string'},
            wards: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {type: 'string'},
                  province_id: {type: 'string'},
                  district_id: {type: 'string'},
                  ward_id: {type: 'string'},
                },
              },
            },
          },
        },
      },
    },
  })
  async getWards(@param.query.number('district_id') districtId: number) {
    const result = Wards.find(ward => ward.district_id === districtId);
    return result;
  }

  @authenticate('jwt')
  @post('address')
  @response(200, {
    description: 'Add new address',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Address,
        },
      },
    },
  })
  async saveAddress(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody()
    address: Address,
  ) {
    const userId = currentUserProfile[securityId];
    address.userId = userId;
    const savedAddress = await this.addressRepository.create(address);
    return savedAddress;
  }

  @authenticate('jwt')
  @get('address')
  @response(200, {
    description: 'Get address',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            'x-ts-type': Address,
          },
        },
      },
    },
  })
  async getAddress(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ) {
    const userId = currentUserProfile[securityId];
    const address = await this.addressRepository.find({
      where: {
        userId,
      },
      order: ['isDefault DESC'],
    });
    return address || [];
  }

  @authenticate('jwt')
  @get('address/{id}')
  @response(200, {
    description: 'Get address',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Address,
        },
      },
    },
  })
  async getAddressById(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @param.path.string('id') id: string,
  ) {
    const userId = currentUserProfile[securityId];
    const address = await this.addressRepository.findOne({
      where: {
        id,
        userId,
      },
    });
    return address;
  }

  @authenticate('jwt')
  @get('address/default')
  @response(200, {
    description: 'Get default address',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Address,
        },
      },
    },
  })
  async getDefaultAddress(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ) {
    const userId = currentUserProfile[securityId];
    const address = await this.addressRepository.findOne({
      where: {
        userId,
        isDefault: true,
      },
    });
    return address;
  }

  @authenticate('jwt')
  @put('address/{id}')
  @response(200, {
    description: 'Update address',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Address,
        },
      },
    },
  })
  async editAddress(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody() updateAddress: Partial<Address>,
    @param.path.string('id') id: string,
  ) {
    const userId = currentUserProfile[securityId];
    const isDefault = updateAddress.isDefault;
    const updateRequest: Promise<unknown>[] = [];
    if (isDefault) {
      updateRequest.push(
        this.addressRepository.execute(
          'Address',
          'findOneAndUpdate',
          {userId: new ObjectId(userId), isDefault: true},
          {
            $set: {isDefault: false},
          },
          {
            returnDocument: 'after',
          },
        ),
      );
    }
    updateRequest.push(
      this.addressRepository.execute(
        'Address',
        'findOneAndUpdate',
        {userId: new ObjectId(userId), _id: new ObjectId(id)},
        {
          $set: omit(updateAddress, 'createdAt', 'userId', 'id'),
        },
        {
          returnDocument: 'after',
        },
      ),
    );
    const [_, editedAddress] = await Promise.all(updateRequest);
    return editedAddress;
  }

  @authenticate('jwt')
  @del('address')
  @response(200, {
    description: 'Delete address',
    content: {
      'application/json': {
        schema: {
          status: 'string',
        },
      },
    },
  })
  async deleteAddress(@requestBody() body: {addressId: string}) {
    try {
      await this.addressRepository.deleteById(body.addressId);
    } catch (e) {
      return {
        status: 'failure',
      };
    }
    return {
      status: 'success',
    };
  }
}
