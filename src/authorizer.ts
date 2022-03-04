import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  Authorizer,
} from '@loopback/authorization';
import {Provider} from '@loopback/core';

// run after voter, will not run if voter previous DENY request
export class MyAuthorizationProvider implements Provider<Authorizer> {
  /**
   * @returns an authorizer function
   *
   */
  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    authorizationCtx: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ) {
    if (authorizationCtx.principals.length > 0) {
      const clientRoles = authorizationCtx.principals[0].roles;
      const allowedRoles = metadata.allowedRoles;

      if (!metadata.allowedRoles) {
        return AuthorizationDecision.ALLOW;
      }

      for (const role of clientRoles) {
        if (allowedRoles!.includes(role)) {
          return AuthorizationDecision.ALLOW;
        }
      }
    }
    return AuthorizationDecision.DENY;
  }
  // if (
  //   context.resource === 'OrderController.prototype.cancelOrder' &&
  //   context.principals[0].name === 'user-01'
  // ) {
  //   return AuthorizationDecision.DENY;
  // }
  // return AuthorizationDecision.ALLOW;
}
