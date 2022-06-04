/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, injectable} from '@loopback/core';
import axios from 'axios';

@injectable({scope: BindingScope.SINGLETON})
export class ShippingService {
  async getService(data: {
    from_district: number;
    to_district: number;
  }): Promise<
    {service_id: number; service_type_id: number; short_name: string}[]
  > {
    const endpoint =
      'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services';
    const shop_id = process.env.GHN_SHOP_ID;
    const token = process.env.GHN_TOKEN;
    const body = {
      ...data,
      shop_id: parseInt(shop_id ?? '2984124'),
    };
    const result = await axios.post(endpoint, body, {
      headers: {
        Accept: 'application/json',
        token: token ?? 'f047137e-df82-11ec-b912-56b1b0c59a25',
      },
    });
    return result.data.data;
  }

  async getExpectedTime(body: {
    from_district_id: number;
    from_ward_code: string;
    service_id: number;
    service_type_id: number | null;
    to_district_id: number;
    to_ward_code: string;
  }): Promise<{
    leadtime: number;
    order_date: number;
  }> {
    const endpoint =
      'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/leadtime';
    const shop_id = process.env.GHN_SHOP_ID;
    const token = process.env.GHN_TOKEN;

    const result = await axios.post(endpoint, body, {
      headers: {
        Accept: 'application/json',
        token: token ?? 'f047137e-df82-11ec-b912-56b1b0c59a25',
        ShopId: parseInt(shop_id ?? '2984124'),
      },
    });
    return result.data.data;
  }

  async getShippingFee(body: {
    from_district_id: number;
    to_district_id: number;
    to_ward_code: string;
    service_id: number;
    service_type_id: null;
    height: number;
    length: number;
    weight: number;
    width: number;
    insurance_value: number;
    coupon: null;
  }): Promise<{
    coupon_value: number;
    insurance_fee: number;
    pick_station_fee: number;
    r2s_fee: number;
    service_fee: number;
    total: number;
  }> {
    const endpoint =
      'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee';
    const shop_id = process.env.GHN_SHOP_ID;
    const token = process.env.GHN_TOKEN;

    const result = await axios.post(endpoint, body, {
      headers: {
        Accept: 'application/json',
        token: token ?? 'f047137e-df82-11ec-b912-56b1b0c59a25',
        ShopId: parseInt(shop_id ?? '2984124'),
      },
    });
    return result.data.data;
  }
}

export namespace ShippingServiceBindings {
  export const SHIPPING_SERVICE = BindingKey.create<ShippingService>(
    `services.${ShippingService.name}.service`,
  );
}
