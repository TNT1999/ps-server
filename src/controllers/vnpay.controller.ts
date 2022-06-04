/* eslint-disable @typescript-eslint/no-explicit-any */
import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  get,
  post,
  Request,
  requestBody,
  Response,
  response,
  RestBindings,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import dayjs from 'dayjs';
import {PaymentStatus, PaymentType} from '../models';
import {OrderRepository} from '../repositories';

function sortObject(o: Record<string, unknown>) {
  const sorted: Record<string, unknown> = {};
  let key;
  const a = [];

  for (key in o) {
    // eslint-disable-next-line no-prototype-builtins
    if (o.hasOwnProperty(key)) {
      a.push(key);
    }
  }

  a.sort();

  for (key = 0; key < a.length; key++) {
    sorted[a[key]] = o[a[key]];
  }
  return sorted;
}
export class VNPayController {
  constructor(
    @inject(RestBindings.Http.REQUEST) public request: Request,
    @inject(RestBindings.Http.RESPONSE) public response: Response,
    @repository(OrderRepository) public orderRepository: OrderRepository,
  ) {}

  @authenticate('jwt')
  @post('vnp/create_payment_url')
  @response(200, {
    description: 'Create vnpay url',
    content: {
      'application/json': {
        schema: {},
      },
    },
  })
  async createPaymentUrl(
    @requestBody() body: {[key: string]: any},
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<string> {
    // saved order
    const ipAddr =
      this.request.headers['x-forwarded-for'] ??
      this.request.connection.remoteAddress ??
      this.request.socket.remoteAddress ??
      this.request.connection.remoteAddress;

    const date = new Date();

    const createDate = dayjs(date).format('YYYYMMDDHHmmss');

    const order = await this.orderRepository.create({
      // products: body.products,
      ...body,
      userId: currentUserProfile[securityId],
      paymentType: PaymentType.VNP,
    });

    const orderId = order.id;
    // const bankCode = body.bankCode;

    // const orderInfo = body.orderDescription;
    // // const orderType = body.orderType;
    // let locale = body.language;
    // if (locale == null || locale === '') {
    //   locale = 'vn';
    // }
    // const currCode = 'VND';
    // let vnpParams: Record<string, unknown> = {};
    // vnpParams['vnp_Version'] = '2';
    // vnpParams['vnp_Command'] = 'pay';
    // vnpParams['vnp_TmnCode'] = tmnCode;
    // // vnpParams['vnp_Merchant'] = ''
    // vnpParams['vnp_Locale'] = locale;
    // vnpParams['vnp_CurrCode'] = currCode;
    // vnpParams['vnp_TxnRef'] = orderId;
    // vnpParams['vnp_OrderInfo'] = orderInfo;
    // // vnpParams['vnp_OrderType'] = orderType;
    // vnpParams['vnp_Amount'] = amount * 100;
    // vnpParams['vnp_ReturnUrl'] = returnUrl;
    // vnpParams['vnp_IpAddr'] = ipAddr;
    // vnpParams['vnp_CreateDate'] = createDate;
    // if (bankCode != null && bankCode !== '') {
    //   vnpParams['vnp_BankCode'] = bankCode;
    // }

    // vnpParams = sortObject(vnpParams);

    // const querystring = require('qs');
    // const signData =
    //   secretKey + querystring.stringify(vnpParams, {encode: false});

    // const sha256 = require('sha256');

    // const secureHash = sha256(signData);
    // vnpParams['vnp_SecureHashType'] = 'SHA256';
    // vnpParams['vnp_SecureHash'] = secureHash;
    // vnpUrl += '?' + querystring.stringify(vnpParams, {encode: true});

    const tmnCode = 'JJN7844V';
    // config.get('vnp_TmnCode');
    const secretKey = 'UQYXWZZTIUVNBOXTHSPCAMWIUWULSRQH';
    // config.get('vnp_HashSecret');
    let vnpUrl = 'http://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

    // const amount = 12121212;
    const bankCode = undefined;

    // var orderInfo = req.body.orderDescription;
    // var orderType = req.body.orderType;
    const locale = 'vn';
    const currCode = 'VND';
    let vnpParams: Record<string, any> = {};
    vnpParams['vnp_Version'] = '2';
    vnpParams['vnp_Command'] = 'pay';
    vnpParams['vnp_TmnCode'] = tmnCode;
    // vnpParams['vnp_Merchant'] = ''
    vnpParams['vnp_Locale'] = locale;
    vnpParams['vnp_CurrCode'] = currCode;
    vnpParams['vnp_TxnRef'] = orderId.toString();
    vnpParams['vnp_OrderInfo'] = 'orderInfo';
    vnpParams['vnp_OrderType'] = 'topup';
    vnpParams['vnp_Amount'] = body.totalAmount * 100;
    vnpParams['vnp_ReturnUrl'] =
      `${process.env.SITE_URL}/check_out` || 'http://localhost:8080/check_out';
    vnpParams['vnp_IpAddr'] = ipAddr;
    vnpParams['vnp_CreateDate'] = createDate;
    if (bankCode != null && bankCode !== '') {
      vnpParams['vnp_BankCode'] = bankCode;
    }
    vnpParams = sortObject(vnpParams);

    const querystring = require('qs');
    const signData = `${secretKey}${querystring.stringify(vnpParams, {
      encode: false,
    })}`;

    const sha256 = require('sha256');

    const secureHash = sha256(signData);

    vnpParams['vnp_SecureHashType'] = 'SHA256';
    vnpParams['vnp_SecureHash'] = secureHash;
    vnpUrl += '?' + querystring.stringify(vnpParams, {encode: true});
    return vnpUrl;
  }

  @get('vnp/ipn_return')
  @response(200, {
    description: 'ipn return url',
    content: {
      'application/json': {
        schema: {
          RspCode: 'string',
          Message: 'string',
        },
      },
    },
  })
  async ipnReturn() {
    let vnpParams: Record<string, any> = this.request.query;
    console.log(vnpParams);
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    vnpParams = sortObject(vnpParams);
    const secretKey = 'UQYXWZZTIUVNBOXTHSPCAMWIUWULSRQH';

    const querystring = require('qs');
    const signData =
      secretKey + querystring.stringify(vnpParams, {encode: false});

    const sha256 = require('sha256');

    const checkSum = sha256(signData);

    if (secureHash === checkSum) {
      console.log('valid');
      const orderId = vnpParams['vnp_TxnRef'];
      const rspCode = vnpParams['vnp_ResponseCode'];
      //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi

      await this.orderRepository.updateById(orderId, {
        paymentStatus: PaymentStatus.SUCCESS,
      });

      return {RspCode: '00', Message: 'success'};
    } else {
      console.log('invalid');
      return {RspCode: '97', Message: 'Fail checksum'};
    }
  }
}
