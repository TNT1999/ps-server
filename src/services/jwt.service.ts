import {TokenService} from '@loopback/authentication';
import {
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/context';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {nanoid} from 'nanoid';
import {promisify} from 'util';
import {UserRepository} from '../repositories';

const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export namespace CustomJWTServiceConstants {
  export const TOKEN_SECRET_VALUE =
    process.env.TOKEN_SECRET ?? 'this is secret key';
  export const TOKEN_EXPIRES_IN_VALUE =
    process.env.TOKEN_SECRET_EXPIRES_IN ?? '21600';
}

export class JWTService implements TokenService {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SECRET)
    private jwtSecret: string,
    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
    private jwtExpiresIn: string,
    @inject(UserServiceBindings.USER_REPOSITORY)
    public userRepository: UserRepository,
  ) {}

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : 'token' is null`,
      );
    }

    let userProfile: UserProfile;

    try {
      // decode user profile from token
      const decodedToken = await verifyAsync(token, this.jwtSecret);
      // don't copy over  token field 'iat' and 'exp', nor 'email' to user profile
      userProfile = Object.assign(
        {[securityId]: '', name: ''},
        {
          [securityId]: decodedToken.id,
          email: decodedToken.email,
          id: decodedToken.id,
          roles: decodedToken.roles,
        },
      );
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : ${error.message}`,
      );
    }
    return userProfile;
  }

  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        'Error generating token : userProfile is null',
      );
    }
    const userInfoForToken = {
      id: userProfile[securityId],
      email: userProfile.email,
      roles: userProfile.roles,
    };
    // Generate a JSON Web Token
    let token: string;
    try {
      token = await signAsync(userInfoForToken, this.jwtSecret, {
        expiresIn: Number(this.jwtExpiresIn),
      });
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error encoding token : ${error}`);
    }

    return token;
  }

  async generateVerificationEmailToken(id: string): Promise<string> {
    if (!id) {
      throw new HttpErrors.Unauthorized('Error generating token : id is null');
    }
    let token: string;
    try {
      token = await signAsync({id}, this.jwtSecret, {
        expiresIn: Number(this.jwtExpiresIn),
      });
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error encoding token : ${error}`);
    }
    return token;
  }

  async verifyConfirmEmailToken(token: string): Promise<string> {
    if (!token) {
      throw new HttpErrors.Unauthorized('Error generating token : id is null');
    }
    try {
      // decode user profile from token
      const decodedToken = await verifyAsync(token, this.jwtSecret);
      return decodedToken.id;
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : ${error.message}`,
      );
    }
  }

  async generateResetPasswordToken(
    email: string,
  ): Promise<{token: string; resetKey: string}> {
    if (!email) {
      throw new HttpErrors.Unauthorized('Not found user with Email');
    }
    let token: string;
    const resetKey = nanoid(64);
    console.log(resetKey);
    try {
      token = await signAsync({email, resetKey}, this.jwtSecret, {
        expiresIn: Number(this.jwtExpiresIn),
      });
      console.log(token);
    } catch (error) {
      throw new HttpErrors.Unauthorized(`Error encoding token : ${error}`);
    }
    return {token, resetKey};
  }

  async verifyResetPasswordToken(
    token: string,
  ): Promise<{email: string; resetKey: string}> {
    if (!token) {
      throw new HttpErrors.Unauthorized('Error generating token : id is null');
    }
    try {
      // decode user profile from token
      const decodedToken = await verifyAsync(token, this.jwtSecret);
      return decodedToken;
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token : ${error.message}`,
      );
    }
  }
}
