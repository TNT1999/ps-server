import {UserService} from '@loopback/authentication';
import {BindingKey} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {compare, genSalt, hash} from 'bcryptjs';
import {User, UserWithRelations} from '../models';
import {UserRepository} from '../repositories';

export type Credentials = {
  email: string;
  password: string;
};

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository) public userRepository: UserRepository,
  ) {}

  async encryptPassword(password: string): Promise<string> {
    const salt = await genSalt();
    return hash(password, salt);
  }

  async createUser(user: User): Promise<User> {
    if (user.password) {
      user.password = await this.encryptPassword(user.password);
    }
    const newUser = await this.userRepository.create(user);
    return newUser;
  }

  // function used in case of login with gg or fb
  async loginOrSignupUser(user: User): Promise<{user: User; newUser: boolean}> {
    const existingUser = await this.userRepository.findOne({
      where: {email: user.email},
    });
    if (existingUser) {
      //login
      return {user: existingUser, newUser: false};
    }
    //create new User
    const newUser = await this.createUser(user);
    // don't need to verify email
    return {user: newUser, newUser: true};
  }

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const invalidCredentialsError = 'Invalid email or password.';
    const foundUser = await this.userRepository.findOne({
      where: {email: credentials.email},
    });
    if (!foundUser || !foundUser.password) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await compare(
      credentials.password,
      foundUser.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  convertToUserProfile(user: User): UserProfile {
    return {
      [securityId]: user.id.toString(),
      id: user.id,
      email: user.email,
      roles: user.roles,
    };
  }

  //function to find user by id
  async findUserById(id: string): Promise<User & UserWithRelations> {
    const userNotfound = 'invalid User';
    const foundUser = await this.userRepository.findOne({
      where: {id: id},
    });

    if (!foundUser) {
      throw new HttpErrors.Unauthorized(userNotfound);
    }
    return foundUser;
  }
}

export namespace MyUserServiceBindings {
  export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>(
    `services.${MyUserService.name}_custom.service`,
  );
}
