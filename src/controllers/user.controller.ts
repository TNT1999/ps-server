import {authenticate, TokenService} from '@loopback/authentication';
import {
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {get, post, requestBody, response, SchemaObject} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {genSalt, hash} from 'bcryptjs';
import omit from 'lodash/omit';
import {ValidateEmailInterceptor} from '../interceptors';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {Credentials, MyUserService, MyUserServiceBindings} from '../services';
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

// @intercept(ValidateEmailInterceptor.BINDING_KEY)
// @intercept(ValidatePhoneNumInterceptor.BINDING_KEY)
export class UserController {
  constructor(
    // @repository(UserRepository)
    // public userRepository: UserRepository,
    @inject(UserServiceBindings.USER_REPOSITORY)
    public userRepository: UserRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(MyUserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
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
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{token: string}> {
    console.log(ValidateEmailInterceptor);
    // ensure the user exists, and the password is correct
    const user = await this.userService.verifyCredentials(credentials);
    // convert a User object into a UserProfile object (reduced set of properties)
    const userProfile = this.userService.convertToUserProfile(user);
    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);
    return {token};
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
  ): Promise<string> {
    console.log(currentUserProfile);
    return currentUserProfile[securityId];
  }

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
    const hashPassword = await hash(newUser.password, await genSalt());
    const savedUser = await this.userRepository.create({
      ...newUser,
      password: hashPassword,
    });

    // await this.userRepository.userCredentials(savedUser.id).create({password});
    return omit(savedUser, 'password', 'role');
    // return savedUser;
  }

  @get('/auth/verify-email')
  @response(200, {
    description: 'User',
    content: {
      'application/json': {
        schema: {
          type: 'string',
        },
      },
    },
  })
  async verifyEmail(
    @requestBody(CredentialsRequestBody) newUser: Credentials,
  ): Promise<string> {
    return 'verify Email';
  }
  // @post('/users')
  // @response(200, {
  //   description: 'User model instance',
  //   content: {'application/json': {schema: getModelSchemaRef(User)}},
  // })
  // async create(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(User, {
  //           title: 'NewUser',
  //           exclude: ['id'],
  //         }),
  //       },
  //     },
  //   })
  //   user: Omit<User, 'id'>,
  // ): Promise<User> {
  //   return this.userRepository.create(user);
  // }

  // @get('/users/count')
  // @response(200, {
  //   description: 'User model count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async count(@param.where(User) where?: Where<User>): Promise<Count> {
  //   return this.userRepository.count(where);
  // }

  // @get('/users')
  // @response(200, {
  //   description: 'Array of User model instances',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'array',
  //         items: getModelSchemaRef(User, {includeRelations: true}),
  //       },
  //     },
  //   },
  // })
  // async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
  //   var a = this.userRepository.find(filter);
  //   a.then(r => console.log(r));
  //   return a;
  // }

  // @patch('/users')
  // @response(200, {
  //   description: 'User PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(User, {partial: true}),
  //       },
  //     },
  //   })
  //   user: User,
  //   @param.where(User) where?: Where<User>,
  // ): Promise<Count> {
  //   return this.userRepository.updateAll(user, where);
  // }

  // @get('/users/{id}')
  // @response(200, {
  //   description: 'User model instance',
  //   content: {
  //     'application/json': {
  //       schema: getModelSchemaRef(User, {includeRelations: true}),
  //     },
  //   },
  // })
  // async findById(
  //   @param.path.string('id') id: string,
  //   @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>,
  // ): Promise<User> {
  //   return this.userRepository.findById(id, filter);
  // }
  // @patch('/users/{id}')
  // @response(204, {
  //   description: 'User PATCH success',
  // })
  // async updateById(
  //   @param.path.string('id') id: string,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(User, {partial: true}),
  //       },
  //     },
  //   })
  //   user: User,
  // ): Promise<void> {
  //   await this.userRepository.updateById(id, user);
  // }

  // @put('/users/{id}')
  // @response(204, {
  //   description: 'User PUT success',
  // })
  // async replaceById(
  //   @param.path.string('id') id: string,
  //   @requestBody() user: User,
  // ): Promise<void> {
  //   await this.userRepository.replaceById(id, user);
  // }

  // @del('/users/{id}')
  // @response(204, {
  //   description: 'User DELETE success',
  // })
  // async deleteById(@param.path.string('id') id: string): Promise<void> {
  //   await this.userRepository.deleteById(id);
  // }
}
