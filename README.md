# ps-server

This application is generated using [LoopBack 4 CLI](https://loopback.io/doc/en/lb4/Command-line-interface.html) with the
[initial project layout](https://loopback.io/doc/en/lb4/Loopback-application-layout.html).


## Install dependencies

By default, dependencies were installed when this application was generated.
Whenever dependencies in `package.json` are changed, run the following command:

```sh
yarn install
```

## Environment Variable

- Create `.env` file store all variable env

## Run the application in development environment

```sh
yarn dev:watch
```

## Run the application

```sh
yarn start
```

You can also run `node .` to skip the build step.

Open http://127.0.0.1:3000 in your browser.

## Rebuild the project

To incrementally build the project:

```sh
yarn run build
```

To force a full build by cleaning up cached artifacts:

```sh
yarn run rebuild
```

## Fix code style and formatting issues

```sh
yarn run lint
```

To automatically fix such issues:

```sh
yarn run lint:fix
```

## Other useful commands

- `yarn run migrate`: Migrate database schemas for models
- `yarn run openapi-spec`: Generate OpenAPI spec into a file
- `yarn run docker:build`: Build a Docker image for this application
- `yarn run docker:run`: Run this application inside a Docker container

## Tests

```sh
yarn test
```
### Commit messages

Each commit must have a `type` and `subject` and optionally, a `scope` and a `body`. Format:

```
type(scope?): subject
\n
body?
```

`type` is one of:

* feat: an end-user feature
* fix: a bug fix
* refactor: code change that does not fix a bug or add a feature, eg. renaming a variable
* perf: code change that improves performance of an existing feature
* revert: reverts a previous commit
* test: unit test or end-to-end test
* chore: misc changes, e.g. build scripts, dev tools, research etc.
* docs: changes to the documentation only

Examples:

```
feat: add authentication feat
fix: remove broken confirmation message
refactor: share logic between controllers and services
perf: speed up query data
revert: revert 2b8c9a1
test: verify reset password feature
chore: add README.md file
docs: add coding guideline
```
### Structure
* `.husky` - git hooks folder.
* `src` - typeScript source code and configuration files.
* `public` - client side assets (JavaScript, HTML, and CSS files) for the home page.
* `models`: store all model file
* `controllers`: store all controllers
* `interceptor`: reusable functions to provide aspect-oriented logic around method invocations
* `datasources`: connector instance that represents data in an external system
* `repository`: provides strong-typed data access (for example, CRUD) operations of a domain model against the underlying database or service
* `services`: store all services

