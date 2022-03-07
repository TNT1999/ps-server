/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, injectable} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import axios from 'axios';

export type Permission = {
  permission: string;
  status: string;
};
@injectable({scope: BindingScope.SINGLETON})
export class FacebookService {
  //exchange authorization code for access token
  async getToken(code: string): Promise<string> {
    const endpoint = 'https://graph.facebook.com/v13.0/oauth/access_token';
    const clientId = process.env.FB_CLIENT_SECRET;
    const clientSecret = process.env.FB_CLIENT_SECRET;

    const params = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${process.env.SITE_URL}/facebook_login`,
    };
    const {data} = await axios.get(endpoint, {
      params,
    });
    return data.access_token;
  }

  async getUser(code: string): Promise<Record<string, string>> {
    const endpoint = 'https://graph.facebook.com/v13.0/me';
    const accessToken = await this.getToken(code);
    const params = {
      access_token: accessToken,
      field: 'id,name,email,birthday,gender',
    };
    const {data} = await axios.get(endpoint, {
      params,
    });

    if (data == null) {
      throw new HttpErrors.Unauthorized();
    }
    return data;
  }

  async getPermission(access_token: string): Promise<Permission[]> {
    const endpoint = 'https://graph.facebook.com/v13.0/me/permissions';
    const params = {
      access_token,
    };
    const {data} = await axios.get(endpoint, {
      params,
    });
    return data.data;
  }
}

export namespace FacebookBindings {
  export const FACEBOOK_SERVICE = BindingKey.create<FacebookService>(
    `services.${FacebookService.name}.service`,
  );
}
