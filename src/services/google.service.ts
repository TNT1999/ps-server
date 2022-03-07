/* eslint-disable @typescript-eslint/naming-convention */
import {BindingKey, BindingScope, injectable} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import axios from 'axios';

@injectable({scope: BindingScope.SINGLETON})
export class GoogleService {
  //exchange authorization code for token
  async getToken(code: string): Promise<string> {
    const endpoint = 'https://oauth2.googleapis.com/token';
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    const body = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.SITE_URL}/google_login`,
    };
    const {data} = await axios.post(endpoint, body, {
      headers: {Accept: 'application/json'},
    });
    return data.id_token;
  }
  // get UserInfo from token
  async getUser(code: string): Promise<Record<string, string>> {
    const idToken = await this.getToken(code);
    const {data} = await axios.get(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + idToken,
    );

    if (data == null) {
      throw new HttpErrors.Unauthorized();
    }
    return data;
  }
}

export namespace GoogleBindings {
  export const GOOGLE_SERVICE = BindingKey.create<GoogleService>(
    `services.${GoogleService.name}.service`,
  );
}
