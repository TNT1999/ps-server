/* eslint-disable @typescript-eslint/naming-convention */
import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {get, response} from '@loopback/rest';
import {S3Service, S3ServiceBindings} from '../services';
export class FileController {
  constructor(
    @inject(S3ServiceBindings.S3_SERVICE)
    public S3Service: S3Service,
  ) {}

  @authenticate('jwt')
  @get('/presigned-url')
  @response(200, {
    description: 'Get presigned URL upload Image',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            presignedUrl: {type: 'string'},
            key: {type: 'string'},
          },
        },
      },
    },
  })
  async getPresignedUrl() {
    // @requestBody() file: {fileName: string; prefix: string},
    const result = await this.S3Service.buildPresignedUrl();
    return result;
  }
}
