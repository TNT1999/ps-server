import {AuthenticationComponent} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MongodbDataSource} from './datasources';
import {UserRepository} from './repositories';
import {MySequence} from './sequence';
import {MyUserService, MyUserServiceBindings} from './services';
export {ApplicationConfig};

export class PsServerApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
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
    this.dataSource(MongodbDataSource, UserServiceBindings.DATASOURCE_NAME);

    // Bind user service
    // console.log(
    //   MyUserServiceBindings.USER_SERVICE,
    //   // MyUserServiceBindings.USER_SERVICE,
    //   UserServiceBindings.USER_REPOSITORY,
    // );
    this.bind(MyUserServiceBindings.USER_SERVICE).toClass(MyUserService);
    // Bind user repository
    this.bind(UserServiceBindings.USER_REPOSITORY).toClass(UserRepository);
    // this.component(AuthorizationComponent);
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
}
