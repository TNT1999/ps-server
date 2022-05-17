/* eslint-disable @typescript-eslint/naming-convention */
import {inject} from '@loopback/core';
import {get, param, Request, response, RestBindings} from '@loopback/rest';
import Districts from '../mocks/address/districts.json';
import Provinces from '../mocks/address/provinces.json';
import Wards from '../mocks/address/wards.json';

export class AddressController {
  constructor(@inject(RestBindings.Http.REQUEST) private req: Request) {}

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
}
