## Description

OAuth and Identity Provider Server for the pet-adoption website.

## Installation

```bash
$ npm install
```

## Dynamo

This app uses DynamoDB. For local development (NODE_ENV === 'local'), you need to have a local DynamoDB instance running on port 8000.

To set up DynamoDB local, visit https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html. You can access the shell at http://localhost:8000/shell/. To start running DynamoDB locally, run the following commmand:

```
java -Djava.library.path=~/LocalDynamo/DynamoDBLocal_lib -jar ~/LocalDynamo/DynamoDBLocal.jar -sharedDb"
```

Personally, I set up an alias called "dyno" that I can run in a bash shell by adding the following to my .bashrc file:

```
alias dyno="java -Djava.library.path=~/LocalDynamo/DynamoDBLocal_lib -jar ~/LocalDynamo/DynamoDBLocal.jar -sharedDb"
```

You will also need to setup the actual table that this app uses. You can look through the code to determine things like what the table name should be and what the indexes are; however, I would recommend getting all that information by taking a look at the jest-dynalite-config.js file.

I have placed some example DynamoDB commands in the `dynamo-commands` folder. Use those in the local DynamoDB shell.

## Running the app Locally

### Without Docker

Note, you must have an instance of dynamo that the app can connect to.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### With Docker

Note, I have not yet added DynamoDB local to the Docker compose file. So, you will still need to run that manually beforehand

`docker compose up --watch`

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

#### Clients

```
// register

POST http://localhost:3000/clients

// request body
{
  "redirect_uris": [
    "http://localhost:3333/callback"
  ],
  "client_name": "JCPets UI",
  "token_endpoint_auth_method": "none"
}
```

#### Authorize

Note, the following requests will redirect you to an address that doesn't exist. That's intentional since I don't have an actual OAuth client to redirect to.

```
// login
GET http://localhost:3000/authorize?response_type=code&client_id=b80c6136-c23b-4702-95d0-0962ecfabf6a&scope=openid%20jcpets:roles%20jcpets:pets:write&redirect_uri=http%3A%2F%2Flocalhost%3A3333%2Fcallback&prompt=login

// consent
GET http://localhost:3000/authorize?response_type=code&client_id=b80c6136-c23b-4702-95d0-0962ecfabf6a&scope=openid%20jcpets:roles%20jcpets:pets:write&redirect_uri=http%3A%2F%2Flocalhost%3A3333%2Fcallback&prompt=consent

// get auth code
GET http://localhost:3000/authorize?response_type=code&client_id=b80c6136-c23b-4702-95d0-0962ecfabf6a&scope=openid%20jcpets:roles%20jcpets:pets:write&redirect_uri=http%3A%2F%2Flocalhost%3A3333%2Fcallback&prompt=none
```

#### Token

```
POST http://localhost:3000/token

// request body
{
  "grant_type": "authorization_code",
  "code": "cf93058a-4826-4b8b-af2a-7b1bc2c7bfe7",
  "redirect_uri": "http://localhost:3000/callback",
  "client_id": "b80c6136-c23b-4702-95d0-0962ecfabf6a"
}
```

#### Keys

```
GET http://localhost:3000/keys
```

## TODO

- verify pkce flow works
- verify state param works
- implement production key pair service.
- setup production domain
- change server metadata endpoint to be /.well-known/openid-configuration
