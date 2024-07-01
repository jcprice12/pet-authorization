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

#### Authorize
Note, the following requests will redirect you to an address that doesn't exist. That's fine (at least until I implement redirect URI verification), you just need to verify that you are redirected with an authorization code. Use the authorization code in a POST request to the /token endpoint to exchange it for your OAuth tokens.

```
http://localhost:3000/authorize?response_type=code&client_id=1234&scope=openid&prompt=login&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Ffoo
http://localhost:3000/authorize?response_type=code&client_id=1234&scope=openid&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Ffoo
```

#### Token
```
http://localhost:3000/token

// request body
{
  "grant_type": "authorization_code",
  "code": "cf93058a-4826-4b8b-af2a-7b1bc2c7bfe7",
  "redirect_uri": "http://localhost:3000/foo/",
  "client_id": "1234"
}

// response
{
    "access_token": "encoded.access.token",
    "scope": "openid",
    "expires_in": 600,
    "token_type": "bearer",
    "id_token": "encoded.oidc.token" // present if "openid" scope included
}

// decoded access token header
{
  "alg": "RS256"
}

// decoded access token payload
{
  "scope": "openid",
  "iat": 1656190231,
  "sub": "869fcc22-febe-4a99-9297-e61a5533b0b4",// user id
  "exp": 1656190831855
}

// decoded id token header
{
  "alg": "RS256"
}

// decoded id token payload
{
  "iat": 1656190231,
  "sub": "869fcc22-febe-4a99-9297-e61a5533b0b4",// user id
  "aud": "1234",// client id
  "exp": 1656190831858
}
```

#### Keys
```
http://localhost:3000/keys
```

## TODO
- revoke related access tokens for already consumed auth code
- validate client IDs. If invalid client ID, then do not redirect
- validate redirect URIs. If invalid redirect URI, then do not redirect
- verify pkce flow works
- verify state parm works
- implement production key pair service
- research if id token and access token should be signed with the same key
- research way to tell consumers how to get public key to verify tokens (included in JWTs?)
- client registration. Dynamic client registration https://datatracker.ietf.org/doc/html/rfc7591