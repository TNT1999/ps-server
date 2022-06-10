/* eslint-disable @typescript-eslint/naming-convention */
import {PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {BindingKey, BindingScope, injectable} from '@loopback/core';
import crypto from 'crypto';
import {promisify} from 'util';
const randomBytes = promisify(crypto.randomBytes);

type PresignedUrl = {
  presignedUrl: string;
  imageURL: string;
};
@injectable({scope: BindingScope.SINGLETON})
export class S3Service {
  private client = new S3Client({
    region: 'ap-southeast-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'AKIA4S23BFQQFKXEBV6C',
      secretAccessKey:
        process.env.AWS_SECRET_ACCESS_KEY ??
        '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',
    },
  });

  public buildImageURL(fileName: string) {
    const imageURL = `https://${
      process.env.USER_BUCKET ?? 'phone-shop'
    }.s3.amazonaws.com/${fileName}`;
    return imageURL;
  }
  public async buildPresignedUrl(): Promise<PresignedUrl> {
    const rawBytes = await randomBytes(16);
    const fileName = rawBytes.toString('hex');

    const key = `${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.USER_BUCKET ?? 'phone-shop',
      Key: key,
      ACL: 'public-read',
    });

    const presignedUrl = await getSignedUrl(this.client, command, {
      expiresIn: parseInt(process.env.PRESIGNED_IMAGE_URL_EXPIRATION ?? '600'),
    });

    const imageURL = this.buildImageURL(key);

    return {presignedUrl, imageURL};
  }
}

export namespace S3ServiceBindings {
  export const S3_SERVICE = BindingKey.create<S3Service>(
    `services.${S3Service.name}.service`,
  );
}
