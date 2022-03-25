import {
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise,
} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import IsEmail from 'isemail';
import {UserRepository} from '../repositories';

@injectable({tags: {key: ValidateEmailInterceptor.BINDING_KEY}})
export class ValidateEmailInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${ValidateEmailInterceptor.name}`;

  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * It checks the area code of the phone number to make sure it matches
   * the provided city name.
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    // Add pre-invocation logic here
    if (invocationCtx.methodName === 'register') {
      const {email} = invocationCtx.args[0];
      if (!IsEmail.validate(email)) {
        throw new HttpErrors.UnprocessableEntity('Email is invalid');
      }
      const emailAlreadyExist = await this.userRepository.find({
        where: {email},
      });
      if (emailAlreadyExist.length) {
        throw new HttpErrors.UnprocessableEntity('Email already exist');
      }
    }
    const result = await next();
    // Add post-invocation logic here
    return result;
  }
}
