import {authenticate} from '@loopback/authentication';
import {
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {authorize} from '@loopback/authorization';
import {inject, intercept} from '@loopback/core';
import {
  get,
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
  response,
  SchemaObject,
} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {compare, genSalt, hash} from 'bcryptjs';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import {ObjectId} from 'mongodb';
import {ValidateEmailInterceptor} from '../interceptors';
import {Order, ROLES, User} from '../models';
import {UserRepository} from '../repositories';
import {
  Credentials,
  EmailService,
  EmailServiceBindings,
  GoogleBindings,
  GoogleService,
  JWTService,
  MyUserService,
  MyUserServiceBindings,
} from '../services';
const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 6,
      maxLength: 512,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};
type ChangePassword = {
  oldPassword: string;
  newPassword: string;
};
const ChangePasswordSchema: SchemaObject = {
  type: 'object',
  required: ['oldPassword', 'newPassword'],
  properties: {
    password: {
      type: 'string',
      minLength: 6,
      maxLength: 512,
    },
    newPassword: {
      type: 'string',
      minLength: 6,
      maxLength: 512,
    },
  },
};

export const ChangePasswordRequestBody = {
  description: 'The input of changePassword',
  required: true,
  content: {
    'application/json': {schema: ChangePasswordSchema},
  },
};

// @intercept(ValidatePhoneNumInterceptor.BINDING_KEY)
export class UserController {
  constructor(
    @inject(UserServiceBindings.USER_REPOSITORY)
    public userRepository: UserRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
    @inject(MyUserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(EmailServiceBindings.EMAIL_SERVICE)
    public emailService: EmailService,
    @inject(GoogleBindings.GOOGLE_SERVICE)
    public googleService: GoogleService,
  ) {}

  @post('auth/login')
  @response(200, {
    description: 'Login for user',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
            },
            user: {
              type: 'object',
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{token: string; user: object}> {
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);
    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);
    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);
    return {token, user: userProfile};
  }

  @post('auth/facebook')
  @response(200, {
    description: 'Login using facebook account',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
            },
            user: {
              type: 'object',
            },
          },
        },
      },
    },
  })
  async loginOrSignupWithFacebook(
    @requestBody() requestBody: {code: string},
  ): Promise<{token: string; user: object}> {
    // ensure the user exists, and the password is correct
    // const user = await this.userService.verifyCredentials(credentials);
    // // convert a User object into a UserProfile object (reduced set of properties)
    // const userProfile = this.userService.convertToUserProfile(user);
    // // create a JSON Web Token based on the user profile
    // const token = await this.jwtService.generateToken(userProfile);
    return {token: 'a', user: {name: 'a'}};
  }

  @post('auth/google')
  @response(200, {
    description: 'Login using Google account',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
            },
            user: {
              type: 'object',
            },
          },
        },
      },
    },
  })
  async loginOrSignupWithGoogle(
    @requestBody() requestBody: {code: string},
  ): Promise<{token: string; user: object}> {
    const {email, sub: googleUserId} = await this.googleService.getUser(
      requestBody.code,
    );
    const {user, newUser} = await this.userService.loginOrSignupUser({
      email,
      googleUserId,
    } as User);
    const userProfile = this.userService.convertToUserProfile(user);
    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);
    return {token, user: userProfile};
  }

  @authenticate('jwt')
  @get('auth/me')
  @response(200, {
    description: 'Get current user',
    content: {
      'application/json': {
        schema: {
          type: 'string',
        },
      },
    },
  })
  async getMe(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<Partial<User>> {
    const userId = currentUserProfile[securityId];
    const currentUser = await this.userService.findUserById(userId);
    return pick(currentUser, ['id', 'name', 'email', 'phone', 'roles']);
  }

  @intercept(ValidateEmailInterceptor.BINDING_KEY)
  @post('/auth/register')
  @response(200, {
    description: 'Register new user',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': User,
        },
      },
    },
  })
  async register(
    @requestBody(CredentialsRequestBody) newUser: Credentials,
  ): Promise<Partial<User>> {
    const savedUser = await this.userService.createUser(newUser as User);
    const verifyEmailToken =
      await this.jwtService.generateVerificationEmailToken(savedUser.id);

    const urlVerifyEmail = `http://localhost:8000/api/auth/verify-email?token=${verifyEmailToken}`;
    await this.emailService.sendVerifyEmailRegister(savedUser, urlVerifyEmail);
    return omit(savedUser, 'password', 'roles');
  }

  @get('/auth/verify-email')
  @response(200, {
    description: 'Verify email',
    content: {
      'application/json': {
        schema: {
          type: 'string',
        },
      },
    },
  })
  async verifyEmail(
    @param.query.string('token') token: string,
  ): Promise<string> {
    const userId = await this.jwtService.verifyConfirmEmailToken(token);
    await this.userRepository.updateById(userId, {
      isActive: true,
      emailVerified: true,
    });
    return 'Success';
  }

  @post('/auth/resetPasswordRequest')
  @response(200, {
    description: 'Forget password for user',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              required: true,
            },
          },
        },
      },
    },
  })
  async resetPasswordRequest(
    @requestBody() requestBody: {email: string},
  ): Promise<string> {
    const {token, resetKey} = await this.jwtService.generateResetPasswordToken(
      requestBody.email,
    );
    const user = await this.userRepository.findOne({
      where: {email: requestBody.email, isActive: true, emailVerified: true},
    });
    if (!user) {
      throw new HttpErrors.Unauthorized('User not found');
    }
    user.resetPasswordToken = resetKey;
    await this.userRepository.save(user);
    await this.emailService.sendResetPasswordMail(user, token);
    //send email
    return 'Reset password link sending to email';
  }

  @post('/auth/resetPasswordComplete')
  @response(200, {
    description: 'Reset password for user',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
              required: true,
            },
            newPassword: {
              type: 'string',
              required: true,
              minLength: 6,
              maxLength: 512,
            },
            secret: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async resetPasswordComplete(
    @param.query.string('token') token: string,
    @requestBody()
    requestBody: {
      newPassword: string;
      email: string;
      token: string;
    },
  ): Promise<string> {
    console.log('COMPLETE');
    const {email, resetKey} = await this.jwtService.verifyResetPasswordToken(
      token,
    );
    console.log('DECODE', email, resetKey);
    const user = await this.userRepository.findOne({
      where: {email, resetPasswordToken: resetKey},
    });
    if (!user) {
      throw new HttpErrors.Unauthorized(
        'User not found or password reset expired.',
      );
    }
    const hashNewPassword = await hash(
      requestBody.newPassword,
      await genSalt(),
    );
    user.password = hashNewPassword;
    user.resetPasswordToken = undefined;
    await this.userRepository.save(user);
    return 'Success';
  }

  @authenticate('jwt')
  @post('/auth/change-password')
  @response(200, {
    description: 'Change password for User',
    content: {
      'application/json': {
        schema: {
          type: 'string',
        },
      },
    },
  })
  async changePassword(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile, // need include @authenticate
    @requestBody(ChangePasswordRequestBody) changePassword: ChangePassword,
  ): Promise<string> {
    const invalidOldPasswordError = 'Invalid password.';
    const userId = currentUserProfile[securityId];
    const currentUser = await this.userService.findUserById(userId);
    if (!currentUser.password) {
      throw new HttpErrors.Unauthorized(invalidOldPasswordError);
    }
    const oldPasswordMatched = await compare(
      changePassword.oldPassword,
      currentUser.password,
    );
    if (!oldPasswordMatched) {
      const invalidOldPasswordError = 'Invalid password.';
      throw new HttpErrors.Unauthorized(invalidOldPasswordError);
    }
    const hashNewPassword = await hash(
      changePassword.newPassword,
      await genSalt(),
    );

    await this.userRepository.updateById(userId, {
      password: hashNewPassword,
      resetPasswordToken: undefined,
    });
    return 'Success';
  }

  @authenticate('jwt')
  @patch('/auth/update-profile')
  @response(200, {
    description: 'Update profile user',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': User,
        },
      },
    },
  })
  async updateProfileUser(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile, // need include @authenticate
    @requestBody() updateProfile: Partial<User>,
  ): Promise<Partial<User>> {
    const userId = currentUserProfile[securityId];
    const result = await this.userRepository.execute(
      'User',
      'findOneAndUpdate',
      {_id: new ObjectId(userId)},
      {
        $set: omit(updateProfile, 'password', 'roles', '_id'),
      },
      {
        returnDocument: 'after',
      },
    );

    return pick(result.value, 'name', 'email', 'phone');
  }

  @authenticate('jwt')
  @authorize({allowedRoles: [ROLES.USER]})
  @get('/auth/getOrders')
  @response(200, {
    description: 'Get all order',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Order,
        },
      },
    },
  })
  async getOrders(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
  ): Promise<Order[]> {
    const orders = await this.userRepository
      .orders(currentUserProfile[securityId])
      .find();
    return orders;
  }

  @authenticate('jwt')
  @post('/auth/createOrder')
  @response(200, {
    description: 'Create order',
    content: {
      'application/json': {
        schema: {
          'x-ts-type': Order,
        },
      },
    },
  })
  async createOrder(
    @inject(SecurityBindings.USER)
    currentUserProfile: UserProfile,
    @requestBody() order: Order,
  ): Promise<Order> {
    const savedOrder = await this.userRepository
      .orders(currentUserProfile[securityId])
      .create(order);
    return savedOrder;
  }
}
