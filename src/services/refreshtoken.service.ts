// import {
//   RefreshTokenServiceBindings,
//   TokenObject,
//   TokenServiceBindings,
// } from '@loopback/authentication-jwt';
// import {BindingKey, inject} from '@loopback/core';
// import {repository} from '@loopback/repository';
// import {HttpErrors} from '@loopback/rest';
// import {securityId, UserProfile} from '@loopback/security';
// import {promisify} from 'util';
// import {JWTService} from '.';
// import {RefreshToken} from '../models';
// import {RefreshTokenRepository} from '../repositories';
// import {MyUserService, MyUserServiceBindings} from './user.service';

// const jwt = require('jsonwebtoken');
// const signAsync = promisify(jwt.sign);
// const verifyAsync = promisify(jwt.verify);

// export namespace RefreshTokenServiceConstants {
//   export const REFRESH_SECRET_VALUE =
//     process.env.REFRESH_SECRET ?? 'this is refresh key';
//   export const REFRESH_EXPIRES_IN_VALUE =
//     process.env.REFRESH_SECRET_EXPIRES_IN ?? '216000';
// }

// export class RefreshTokenService {
//   constructor(
//     @inject(RefreshTokenServiceBindings.REFRESH_SECRET)
//     private jwtRefresh: string,
//     @inject(RefreshTokenServiceBindings.REFRESH_EXPIRES_IN)
//     private jwtRefreshExpiresIn: string,
//     // @repository(RefreshTokenRepository)
//     // private refreshTokenRepository: RefreshTokenRepository,
//     @inject(MyUserServiceBindings.USER_SERVICE)
//     public userService: MyUserService,
//     @inject(TokenServiceBindings.TOKEN_SERVICE)
//     public jwtService: JWTService,
//   ) {}

//   async verifyToken(refreshToken: string): Promise<RefreshToken> {
//     try {
//       const payload = await verifyAsync(refreshToken, this.jwtRefresh);
//       const userRefreshData = await this.refreshTokenRepository.get(
//         payload.aud,
//       );
//       if (userRefreshData.refreshToken !== refreshToken) {
//         throw new HttpErrors.Unauthorized('Invalid Token');
//       }
//       return userRefreshData;
//     } catch (error) {
//       throw new HttpErrors.Unauthorized(error.message);
//     }
//   }
//   /**
//    * Generate a refresh token, bind it with the given user profile + access
//    * token, then store them in backend.
//    */
//   async generateToken(
//     userProfile: UserProfile,
//     accessToken: string,
//   ): Promise<Partial<TokenObject>> {
//     const data = {};
//     const refreshToken = await signAsync(data, this.jwtRefresh, {
//       expiresIn: Number(this.jwtRefreshExpiresIn),
//       audience: userProfile[securityId],
//     });
//     const result = {
//       accessToken: accessToken,
//       refreshToken: refreshToken,
//     };
//     const userId = userProfile[securityId];
//     await this.refreshTokenRepository.set(userId, {
//       userId,
//       refreshToken,
//     });
//     return result;
//   }

//   /*
//    * Refresh the access token bound with the given refresh token.
//    */
//   async refreshToken(refreshToken: string): Promise<Partial<TokenObject>> {
//     try {
//       if (!refreshToken) {
//         throw new HttpErrors.Unauthorized(
//           `Error verifying token : 'refresh token' is null`,
//         );
//       }
//       const userRefreshData = await this.verifyToken(refreshToken);
//       const user = await this.userService.findUserById(
//         userRefreshData.userId.toString(),
//       );
//       const userProfile = this.userService.convertToUserProfile(user);
//       // create a JSON Web Token based on the user profile
//       const token = await this.jwtService.generateToken(userProfile);
//       await this.revokeToken(userRefreshData.userId.toString());
//       const result = await this.generateToken(userProfile, token);
//       return result;
//     } catch (error) {
//       throw new HttpErrors.Unauthorized(error.message);
//     }
//   }

//   async revokeToken(userId: string): Promise<void> {
//     try {
//       await this.refreshTokenRepository.delete(userId);
//     } catch (error) {
//       throw new HttpErrors.Unauthorized(error.message);
//     }
//   }
// }
// export namespace MyRefreshTokenServiceBindings {
//   export const REFRESH_TOKEN_SERVICE = BindingKey.create<RefreshTokenService>(
//     `services.${RefreshTokenService.name}_custom.service`,
//   );
// }
