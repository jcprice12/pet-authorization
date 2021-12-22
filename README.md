## Description

OAuth and Identity Provider Server for the pet-adoption website.

## Installation

```bash
$ npm install
```

## Dynamo

This app uses DynamoDB. For local development (NODE_ENV === 'local'), you need to have a local DynamoDB instance running on port 8000.

To set up DynamoDB local, visit https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html. You can access the shell at http://localhost:8000/shell/. To start running DynamoDB locally, run the following in a command prompt window:

```
java -Djava.library.path=~/LocalDynamo/DynamoDBLocal_lib -jar ~/LocalDynamo/DynamoDBLocal.jar -sharedDb"
```

Personally, I set up an alias called "dyno" that I can run in a bash shell by adding the following to my .bashrc file:

```
alias dyno="java -Djava.library.path=~/LocalDynamo/DynamoDBLocal_lib -jar ~/LocalDynamo/DynamoDBLocal.jar -sharedDb"
```

## Running the app

Note, you must have an instance of dynamo that the app can connect to.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

### Commands
```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Manual
```
# authorize
http://localhost:3000/authorize?response_type=code&client_id=1234&scope=openid&prompt=login&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Ffoo
```
