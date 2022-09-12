import {AuthenticationComponent} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {
  AuthorizationComponent,
  AuthorizationTags,
} from '@loopback/authorization';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {Request, Response, RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import morgan from 'morgan';
import path from 'path';
import {MyAuthorizationProvider} from './authorizer';
import {loggerMiddleware} from './middleware';
import {UserRepository} from './repositories';
import {MySequence} from './sequence';
import {
  CustomJWTServiceConstants,
  EmailService,
  EmailServiceBindings,
  FacebookBindings,
  FacebookService,
  GoogleBindings,
  GoogleService,
  JWTService,
  // MyRefreshTokenServiceBindings,
  MyUserService,
  MyUserServiceBindings,
  ProductService,
  ProductServiceBindings,
  // RefreshTokenService,
  // RefreshTokenServiceConstants,
  S3Service,
  S3ServiceBindings,
  ShippingService,
  ShippingServiceBindings,
} from './services';
export {ApplicationConfig};

export class PsServerApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.middleware(loggerMiddleware);
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);
    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);
    this.component(AuthorizationComponent);
    // this.dataSource(MongodbDataSource, UserServiceBindings.DATASOURCE_NAME);
    this.setupBinding();
    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  private setupBinding() {
    // Bind user service
    this.bind(MyUserServiceBindings.USER_SERVICE).toClass(MyUserService);
    // Bind user repository
    this.bind(UserServiceBindings.USER_REPOSITORY).toClass(UserRepository);
    // Bind email service
    this.bind(EmailServiceBindings.EMAIL_SERVICE).toClass(EmailService);
    // Bind jwt service
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
    // Bind refresh token service
    // this.bind(MyRefreshTokenServiceBindings.REFRESH_TOKEN_SERVICE).toClass(
    //   RefreshTokenService,
    // );
    // Bind token constants
    this.bind(TokenServiceBindings.TOKEN_SECRET).to(
      CustomJWTServiceConstants.TOKEN_SECRET_VALUE,
    );
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      CustomJWTServiceConstants.TOKEN_EXPIRES_IN_VALUE,
    );
    // Bind refresh token contains
    // this.bind(RefreshTokenServiceBindings.REFRESH_SECRET).to(
    //   RefreshTokenServiceConstants.REFRESH_SECRET_VALUE,
    // );
    // this.bind(RefreshTokenServiceBindings.REFRESH_EXPIRES_IN).to(
    //   RefreshTokenServiceConstants.REFRESH_EXPIRES_IN_VALUE,
    // );
    // Bind product service
    this.bind(ProductServiceBindings.PRODUCT_SERVICE).toClass(ProductService);
    // Bind the authorizer provider
    this.bind('authorizationProviders.my-authorizer-provider')
      .toProvider(MyAuthorizationProvider)
      .tag(AuthorizationTags.AUTHORIZER);

    // binding google, facebook, shipping and S3 Storage service through @injectable
    this.bind(GoogleBindings.GOOGLE_SERVICE).toInjectable(GoogleService);
    this.bind(FacebookBindings.FACEBOOK_SERVICE).toInjectable(FacebookService);
    this.bind(ShippingServiceBindings.SHIPPING_SERVICE).toInjectable(
      ShippingService,
    );
    this.bind(S3ServiceBindings.S3_SERVICE).toInjectable(S3Service);
  }

  private setupLogging() {
    const morganFactory = (config?: morgan.Options<Request, Response>) => {
      return morgan('combined', config);
    };

    const defaultConfig: morgan.Options<Request, Response> = {};

    this.expressMiddleware(morganFactory, defaultConfig, {
      injectConfiguration: 'watch',
      key: 'middleware.morgan',
    });
  }
}
