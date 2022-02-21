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
import {UserRepository} from '../repositories';

@injectable({tags: {key: ValidatePhoneNumInterceptor.BINDING_KEY}})
export class ValidatePhoneNumInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${ValidatePhoneNumInterceptor.name}`;

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
      const {phone} = invocationCtx.args[0];
      const phoneAlreadyExist = await this.userRepository.find({
        where: {phone},
      });
      if (phoneAlreadyExist.length) {
        throw new HttpErrors.UnprocessableEntity('Phone number already exist');
      }
    }

    const result = await next();
    // Add post-invocation logic here
    return result;
  }
}
