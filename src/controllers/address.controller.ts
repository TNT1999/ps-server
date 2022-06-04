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
import axios from 'axios';
import omit from 'lodash/omit';
import {ObjectId} from 'mongodb';
import Districts from '../mocks/address/ghnDistrict.json';
import Provinces from '../mocks/address/ghnProvince.json';
// import Wards from '../mocks/address/wards.json'
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
    // const province = await axios.get(
    //   'https://online-gateway.ghn.vn/shiip/public-api/master-data/province',
    //   {
    //     headers: {
    //       token: 'f047137e-df82-11ec-b912-56b1b0c59a25',
    //     },
    //   },
    // );
    // return province.data.data;
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
    // const district = await axios.get(
    //   `https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${provinceId}`,
    //   {
    //     headers: {
    //       token: 'f047137e-df82-11ec-b912-56b1b0c59a25',
    //     },
    //   },
    // );
    // return district.data.data;

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
    // const result = Wards.find(ward => ward.district_id === districtId);
    const wards = await axios.get(
      `https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${districtId}`,
      {
        headers: {
          token: 'f047137e-df82-11ec-b912-56b1b0c59a25',
        },
      },
    );
    return wards.data.data;
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
    createAddress: Address,
  ) {
    const userId = currentUserProfile[securityId];
    createAddress.userId = userId;
    const isDefault = createAddress.isDefault;
    const countAddress = await this.addressRepository.count({
      userId,
    });
    if (countAddress.count === 0) {
      createAddress.isDefault = true;
      const result = await this.addressRepository.create(createAddress);
      return {
        message: 'success',
        data: result,
      };
    }
    const createRequest: Promise<unknown>[] = [];
    if (isDefault) {
      createRequest.push(
        this.addressRepository.execute(
          'Address',
          'findOneAndUpdate',
          {userId: new ObjectId(userId), isDefault: true},
          {
            $set: {isDefault: false},
          },
        ),
      );
    }
    createRequest.push(this.addressRepository.create(createAddress));
    try {
      const result = await Promise.all(createRequest);
      return isDefault
        ? {
            message: 'success',
            data: result[1],
          }
        : {
            message: 'success',
            data: result[0],
          };
    } catch {
      return {
        message: 'fail',
      };
    }
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
    const countAddress = await this.addressRepository.count({
      userId,
    });
    if (countAddress.count === 1 && !updateAddress.isDefault) {
      return {
        message: 'fail',
        err: 'at least 1 address default',
      };
    }

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
    try {
      const result = await Promise.all(updateRequest);
      return isDefault
        ? {
            message: 'success',
            data: result[1],
          }
        : {
            message: 'success',
            data: result[0],
          };
    } catch {
      return {
        message: 'fail',
      };
    }
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
  async deleteAddress(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody() body: {addressId: string},
  ) {
    const userId = currentUserProfile[securityId];
    const countAddress = await this.addressRepository.count({
      userId,
    });
    if (countAddress.count === 0) {
      return {
        message: 'fail',
        data: 'at least 1 address or cant delete default address',
      };
    }

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
