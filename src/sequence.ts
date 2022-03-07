import {
  AuthenticateFn,
  AuthenticationBindings,
  AUTHENTICATION_STRATEGY_NOT_FOUND,
  USER_PROFILE_NOT_FOUND,
} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  ExpressRequestHandler,
  FindRoute,
  InvokeMethod,
  InvokeMiddleware,
  ParseParams,
  Reject,
  RequestContext,
  Send,
  SequenceActions,
  SequenceHandler,
} from '@loopback/rest';
import morgan from 'morgan';
import {chalk, error, warning} from './utils';

const middlewareList: ExpressRequestHandler[] = [
  morgan((tokens, req, res) => {
    const method = tokens.method(req, res);
    const status = tokens.status(req, res);
    return [
      chalk.blue(tokens['remote-addr'](req, res)),
      method === 'GET' ? chalk.greenBright.bold(method) : warning.bold(method),
      chalk.cyan.underline(tokens.url(req, res)),
      status === '200' ? chalk.green.bold(status) : error.bold(status),
      chalk.yellow(tokens['response-time'](req, res)),
    ].join(' ');
  }),
];
export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) protected send: Send,
    @inject(SequenceActions.REJECT) protected reject: Reject,
    @inject(SequenceActions.INVOKE_MIDDLEWARE, {optional: true})
    protected invokeMiddleware: InvokeMiddleware = () => false,
    // ---- ADD THIS LINE ------
    @inject(AuthenticationBindings.AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn,
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      const finished = await this.invokeMiddleware(context, middlewareList);
      if (finished) {
        return;
      }

      const route = this.findRoute(request);
      // - enable jwt auth -
      // call authentication action
      // ---------- ADD THIS LINE -------------
      await this.authenticateRequest(request);
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      // console.log(args, result);
      this.send(response, result);
    } catch (err) {
      // ---------- ADD THIS SNIPPET -------------
      // if error is coming from the JWT authentication extension
      // make the statusCode 401
      if (
        err.code === AUTHENTICATION_STRATEGY_NOT_FOUND ||
        err.code === USER_PROFILE_NOT_FOUND
      ) {
        Object.assign(err, {statusCode: 401 /* Unauthorized */});
      }
      // ---------- END OF SNIPPET -------------
      this.reject(context, err);
    }
  }
}
