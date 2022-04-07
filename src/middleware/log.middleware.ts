import {Next} from '@loopback/core';
import {Middleware, MiddlewareContext} from '@loopback/rest';
import {chalk, error, warning} from '../utils';

export const loggerMiddleware: Middleware = async (
  middlewareCtx: MiddlewareContext,
  next: Next,
) => {
  const {request, response} = middlewareCtx;
  const method = request.method;
  console.log(
    'Request:  ' +
      (method === 'GET'
        ? chalk.greenBright.bold(method)
        : warning.bold(method)) +
      ' ' +
      chalk.cyan.underline(request.originalUrl) +
      ' ',
  );
  try {
    // Proceed with next middleware
    const result = await next();
    const statusCode = response.statusCode;
    console.log(chalk.green.bold(statusCode));
    return result;
  } catch (err) {
    // Catch errors from downstream middleware
    const statusCode = response.statusCode;
    console.log(error.bold(statusCode));
    throw err;
  }
};
